#!/usr/bin/env python3

from subprocess import Popen, PIPE
import argparse
import datetime
import logging
import os
import struct
import sys
import threading
import time
import traceback


def postmessage(message):
    """ Send message to the Chrome extension """
    if isinstance(message, str):
        message = f'"{message}"'
    sys.stdout.buffer.write(struct.pack('I', len(message)))
    sys.stdout.buffer.write(message.encode('utf8'))
    sys.stdout.flush()


def now():
    """ Now """
    YMDHMS = '%Y-%m-%d %H:%M:%S'
    return datetime.datetime.now().strftime(YMDHMS)


def command(cmd):
    """ Run command and get output """
    return Popen(cmd, stdout=PIPE, shell=True).communicate()[0].decode('utf8')


def wifi_status():
    """ Wifi radio status """
    status = command('nmcli radio wifi').strip()
    return {
        'enabled': 'online',
        'disabled': 'offline',
    }[status]


def alog(fname=None, name='app'):
    """ Quick logger """
    if not fname:
        fname = os.path.abspath(__file__)
        fname = fname.replace('.', '_')
        fname = fname.replace(' ', '-')
        fname = f'~/{fname}.quicklog.log'
    fname = os.path.abspath(os.path.expanduser(fname))
    logging.basicConfig(
        filename=fname,
        filemode='a',
        format='%(asctime)s %(name)s %(levelname)s %(message)s',
        datefmt='%H:%M:%S',
        level=logging.DEBUG,
    )
    return logging.getLogger(name)


def monitor_status():
    """ Reports the wifi status to the extension """
    laststatus = ''
    while True:
        status = wifi_status()
        if status != laststatus:
            alog().info(f'WiFi status has changed to "{status}"')
            postmessage(status)
        laststatus = status
        time.sleep(5)


def start_checker():
    """ Starts monitoring the wifi status in the background """
    thread = threading.Thread(target=monitor_status)
    thread.daemon = True
    thread.start()


def toggle_wifi():
    """ Toggle wifi """
    status = wifi_status()
    alog().info(f'Toggling wifi connection')
    if status == 'online':
        os.system('nmcli radio wifi off')
        postmessage('+offline')
    else:
        os.system('nmcli radio wifi on')
        postmessage('+online')
    return status


def main(args=None):
    """ Main """
    loop = 0
    while True:
        alog().info(f'[{loop}]: Waiting for next command...')
        loop += 1
        length = sys.stdin.read(4)
        if len(length) == 0:
            alog().info('[●] Connection with extension lost. Shutting down...')
            sys.exit(0)
        tlength = struct.unpack('i', length.encode('utf8'))[0]
        message = sys.stdin.read(tlength)
        alog().info(f'msg({tlength}) => {message}')
        if 'toggle-wifi' in message:
            status = toggle_wifi()
            alog().info(f'Wifi is {status}. Toggling connection status...')


if __name__ == '__main__':
    alog('~/chrome-wifi-toggler.log')
    alog().info('\n\n[◆] NativeMessagingHost Invoked...')
    try:
        start_checker()
        main()
    except SystemExit:
        pass
    except:
        tback = traceback.format_exc()
        alog().error(tback)
