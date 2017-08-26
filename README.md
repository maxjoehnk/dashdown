# dashdown

[![Greenkeeper badge](https://badges.greenkeeper.io/maxjoehnk/dashdown.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/maxjoehnk/dashdown.svg?branch=master)](https://travis-ci.org/maxjoehnk/dashdown)

```dashdown``` is a small tool to shutdown multiple things on the press of an amazon-dash-button.
Right now it supports:
- yamaha-avr's
- philips-hue
- HDMI CEC over libcec

## Usage
__1. Clone the Repo__

```bash
git clone https://github.com/maxjoehnk/dashdown.git
```

__2. Install dependencies__

```bash
npm i
```

__3. Search for your Dash Button__

To do this you can use the ```findbutton``` script provided by ```node-dash-button```:
```bash
sudo npx findbutton
```
Now press your dash-button and add the listed address to your config file.

__4. Configure targets__

Add the addresses of the targets you wanna shutdown to the config file.
You don't need to add the username field for the philips-hue, this will be auto populated when you first start ```dashdown```

__5. Connect Hue Bridge (optional)__

When you wanna connect to a hue bridge press the connect button on your bridge before starting ```dashdown```. When the message ```Setup Complete``` appears the hue.username field of your config should be populated.

## Configuration
```json
{
    "avr": "<ip address of the avr>",
    "dash": "<mac address of the dash button>",
    "hue": {
        "ip": "<ip address of the hue bridge>",
        "username": "<bridge username>"
    },
    "cec": "<hdmi address of the device to turn off>"
}
```
