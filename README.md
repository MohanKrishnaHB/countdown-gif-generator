# Gif countdown generator

Github repo: [MohanKrishnaHB/countdown-gif-generator](https://github.com/MohanKrishnaHB/countdown-gif-generator)

The very simple app I have created allows you to generate a countdown timer animated gif depending on the URL parameters you provide. [View demo](http://counter-generator-1.azurewebsites.net/).

## URL Parameters (*required)

* **time*** - Date &amp; time when your countdown will end [e.g. 2016-06-24T20:35]
* **frames** - number of frames (also number of seconds) the countdown will run before looping [defaults to 30]
* **bg** - hex colour code for the background [defaults to ffffff]
* **color** - hex colour code for the text [defaults to 363636]
* **name** - filename used for the generated gif [defaults to 'default']
* **expiredText** - text to display after time is expired [default to 'Event Ended']
* **timeFontSize** - font size of time numbers [default to '60']
* **timeWordsFontSize** - font size of text below time [default to '14']
* **experiedTextFontSize** - font size of expired text [default to '40']
* **strokColor** - hex colour code for the lines [defaults to DFE4EA]
* **hasSeconds** - need seconds to be displayed in gif [default to true]
* **daysText** - text to display below days [default to 'DAYS']
* **hoursText** - text to display below hours [default to 'HOURS']
* **minsText** - text to display below minutes [default to 'MINS']
* **secondsText** - text to display below seconds [default to 'SECONDS']
            
## Generate Examples

These trigger a download. Change the URL from `/generate` to `/serve` when used in an image tag.

* **Basic**: [/generate?time=2018-09-24T20:35](http://counter-generator-1.azurewebsites.net/generate?time=2018-09-24T20:35&name=ex1)
* **Custom colours**: [/generate?time=2018-09-24T20:35&bg=028900&color=adff00](http://counter-generator-1.azurewebsites.net/generate?time=2018-09-24T20:35&bg=028900&color=adff00&name=ex3)
* **Custom name & frames**: [/generate?time=2018-09-24T20:35&name=awesome-gif&frames=20](http://counter-generator-1.azurewebsites.net/generate?time=2018-09-24T20:35&name=awesome-gif&frames=20)

## Dockerizing the application

Build Docer image: `docker build -t <image-name> .`

Creating tag: `docker tag <image-name> <username>/<image-name>`

Create Docker container/Run: `docker run -p 3000:8080 <image-name>`

### Already published docker image: [mohankrishnahb/counter-generator-1](https://hub.docker.com/r/mohankrishnahb/counter-generator-1)

## License

[MIT](LICENSE)

## Inspired by

* [scottccoates](https://github.com/scottccoates/node-countdown-gif)
* [Nooshu](https://github.com/Nooshu/node-countdown-gif)

