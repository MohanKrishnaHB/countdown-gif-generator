'use strict';

const fs = require('fs');
const path = require('path');
const GIFEncoder = require('gifencoder');
const Canvas = require('canvas');
const moment = require('moment');

module.exports = {
    /**
     * Initialise the GIF generation
     * @param {string} time
     * @param {number} width
     * @param {number} height
     * @param {string} color
     * @param {string} bg
     * @param {string} name
     * @param {number} frames
     * @param {requestCallback} cb - The callback that is run once complete.
     */
    init: function(time, width=632, height=158, color='363636', bg='ffffff', name='default', frames=30, cb, expiredText='Event Ended', timeFontSize="60", timeWordsFontSize="14", experiedTextFontSize="40", strokColor1="DFE4EA", hasSeconds=true, strokColor2="2C66B4"){
        // Set some sensible upper / lower bounds
        this.hasSeconds = hasSeconds == "true" ? true : false;

        this.width = this.hasSeconds ? this.clamp(width, 150, 700) : this.clamp(width - 158, 150, 700);
        this.height = this.clamp(height, 40, 500);
        this.frames = this.clamp(frames, 1, 1500);

        this.bg = '#' + bg;
        this.textColor = '#' + color;
        this.strokColor1 = '#' + strokColor1;
        this.strokColor2 = '#' + strokColor2;
        this.name = name;
        this.expiredText = expiredText;
        // loop optimisations
        this.halfWidth = Number(this.width / 2);
        this.halfHeight = Number(this.height / 2.2);
        
        this.encoder = new GIFEncoder(this.width, this.height);
        this.canvas = Canvas.createCanvas(this.width, this.height);
        this.ctx = this.canvas.getContext('2d');

        //font size
        this.timeFontSize = timeFontSize;
        this.timeWordsFontSize = timeWordsFontSize;
        this.experiedTextFontSize = experiedTextFontSize;

        this.daysText = "DAYS";
        this.hoursText = "HOURS";
        this.minsText = "MINUTES";
        this.secondsText = "SECONDS";

        this.fontFamily = "helvetica";

        // calculate the time difference (if any)
        let timeResult = this.time(time);
        
        // start the gif encoder
        this.encode(timeResult, cb);
    },
    /**
     * Limit a value between a min / max
     * @link http://stackoverflow.com/questions/11409895/whats-the-most-elegant-way-to-cap-a-number-to-a-segment
     * @param number - input number
     * @param min - minimum value number can have
     * @param max - maximum value number can have
     * @returns {number}
     */
    clamp: function(number, min, max){
        return Math.max(min, Math.min(number, max));
    },
    /**
     * Calculate the diffeence between timeString and current time
     * @param {string} timeString
     * @returns {string|Object} - return either the date passed string, or a valid moment duration object
     */
    time: function (timeString) {
        // grab the current and target time
        let target = moment(timeString.replace(" ", "+"));
        let current = moment();
        
        // difference between the 2 (in ms)
        let difference = target.diff(current);
        
        // either the date has passed, or we have a difference
        if(difference <= 0){
            return 'Date has passed!';
        } else {
            // duration of the difference
            return moment.duration(difference);
        }
    },
    /**
     * Encode the GIF with the information provided by the time function
     * @param {string|Object} timeResult - either the date passed string, or a valid moment duration object
     * @param {requestCallback} cb - the callback to be run once complete
     */
    encode: function(timeResult, cb){
        let enc = this.encoder;
        let ctx = this.ctx;
        let tmpDir = process.cwd() + '/tmp/';
        
        // create the tmp directory if it doesn't exist
        if (!fs.existsSync(tmpDir)){
            fs.mkdirSync(tmpDir);
        }
        
        let filePath = tmpDir + this.name + '.gif';
        
        // pipe the image to the filesystem to be written
        let imageStream = enc
                .createReadStream()
                    .pipe(fs.createWriteStream(filePath));
        // once finised, generate or serve
        imageStream.on('finish', () => {
            // only execute callback if it is a function
            typeof cb === 'function' && cb();
        });
        
        // estimate the font size based on the provided width
        let fontWeight = "bold"
        // let fontSize = Math.floor(this.width / 10) + 'px';
        let fontSize = this.timeFontSize + 'px';
        let fontFamily = this.fontFamily; // monospace works slightly better
        
        this.timeStartHeight = (this.height / 2) - 10;
        this.textStartHeight = (this.height / 2) + (parseInt(this.timeFontSize) / 3) + 10;
        
        // set the font style
        ctx.font = [fontWeight, fontSize, fontFamily].join(' ');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // start encoding gif with following settings
        enc.start();
        enc.setRepeat(0);
        enc.setDelay(1000);
        enc.setQuality(90);

        // if we have a moment duration object
        if(typeof timeResult === 'object'){
            for(let i = 0; i < this.frames; i++){
                // extract the information we need from the duration
                let days = Math.floor(timeResult.asDays());
                let hours = Math.floor(timeResult.asHours() - (days * 24));
                let minutes = Math.floor(timeResult.asMinutes()) - (days * 24 * 60) - (hours * 60);
                let seconds = Math.floor(timeResult.asSeconds()) - (days * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60);
                
                // make sure we have at least 2 characters in the string
                days = (days.toString().length == 1) ? '0' + days : days;
                hours = (hours.toString().length == 1) ? '0' + hours : hours;
                minutes = (minutes.toString().length == 1) ? '0' + minutes : minutes;
                seconds = (seconds.toString().length == 1) ? '0' + seconds : seconds;
                
                // build the date string
                // let string = [days, 'd ', hours, 'h ', minutes, 'm ', seconds, 's'].join('');
                
                

                // paint BG
                ctx.fillStyle = this.bg;
                ctx.fillRect(0, 0, this.width, this.height);
                
                // paint text
                ctx.fillStyle = this.textColor;
                // ctx.fillText(string, this.halfWidth, this.halfHeight);  //To be uncommented

                if(days >= 0){    
                    if(this.hasSeconds) {
                        ctx.fillText(days, (this.width / 2) - ((this.width / 2) / 2) - (((this.width / 2) / 2) / 2), this.timeStartHeight);
                        ctx.fillText(hours, (this.width / 2) - ((this.width / 2) / 2) + (((this.width / 2) / 2) / 2), this.timeStartHeight);
                        ctx.fillText(minutes, (this.width / 2) + ((this.width / 2) / 2) - (((this.width / 2) / 2) / 2), this.timeStartHeight);
                        ctx.fillText(seconds, (this.width / 2) + ((this.width / 2) / 2) + (((this.width / 2) / 2) / 2), this.timeStartHeight);

                        
                        let fontWeight = "bold"
                        // let fontSize = Math.floor(this.width / 10) + 'px';
                        let fontSize = this.timeWordsFontSize + 'px';
                        let fontFamily = this.fontFamily; // monospace works slightly better
                        
                        // set the font style
                        ctx.font = [fontWeight, fontSize, fontFamily].join(' ');
                        
                        ctx.fillText(days < 2 ? this.daysText.slice(0, -1) : this.daysText, (this.width / 2) - ((this.width / 2) / 2) - (((this.width / 2) / 2) / 2), this.textStartHeight);
                        ctx.fillText(hours < 2 ? this.hoursText.slice(0, -1) : this.hoursText, (this.width / 2) - ((this.width / 2) / 2) + (((this.width / 2) / 2) / 2), this.textStartHeight);
                        ctx.fillText(minutes < 2 ? this.minsText.slice(0, -1) : this.minsText, (this.width / 2) + ((this.width / 2) / 2) - (((this.width / 2) / 2) / 2), this.textStartHeight);
                        ctx.fillText(seconds < 2 ? this.secondsText.slice(0, -1) : this.secondsText, (this.width / 2) + ((this.width / 2) / 2) + (((this.width / 2) / 2) / 2), this.textStartHeight);

                        // ctx.strokeStyle = this.strokColor1;
                        // ctx.beginPath();
                        // ctx.moveTo((this.width / 4), 20);
                        // ctx.lineTo((this.width / 4), 120);
                        // ctx.stroke();

                        
                        // ctx.beginPath();
                        // ctx.moveTo(this.width / 2, 20);
                        // ctx.lineTo(this.width / 2, 120);
                        // ctx.stroke();
                        
                        // ctx.beginPath();
                        // ctx.moveTo((this.width * 3 / 4), 20);
                        // ctx.lineTo((this.width * 3 / 4), 120);
                        // ctx.stroke();


                        /** Arc Start */

                        /** Background arc Start */
                        ctx.strokeStyle = this.strokColor2;
                        ctx.lineWidth = 7;
                        ctx.beginPath();
                        ctx.arc(this.width / 8, this.height / 2, 70, 0, 2 * Math.PI);
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.arc((3 * this.width / 8), this.height / 2, 70, 0, 2 * Math.PI);
                        ctx.stroke();

                        
                        ctx.beginPath();
                        ctx.arc((5 * this.width / 8), this.height / 2, 70, 0, 2 * Math.PI);
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.arc((7 * this.width / 8), this.height / 2, 70, 0, 2 * Math.PI);
                        ctx.stroke();

                        /** Background arc End */

                        /** Foreground arc Start */

                        ctx.strokeStyle = this.strokColor1;
                        ctx.lineWidth = 7.8;
                        ctx.beginPath();
                        ctx.arc(this.width / 8, this.height / 2, 70, (3 * Math.PI / 2) + (2 * Math.PI) + (days * 2 * Math.PI / 50), 3 * Math.PI / 2);
                        ctx.stroke();

                        
                        ctx.beginPath();
                        ctx.arc((3 * this.width / 8), this.height / 2, 70, (3 * Math.PI / 2) + (2 * Math.PI) + (hours * 2 * Math.PI / 24), 3 * Math.PI / 2);
                        ctx.stroke();

                        
                        ctx.beginPath();
                        ctx.arc((5 * this.width / 8), this.height / 2, 70, (3 * Math.PI / 2) + (2 * Math.PI) + (minutes * 2 * Math.PI / 60), 3 * Math.PI / 2);
                        ctx.stroke();

                        ctx.beginPath();
                        // ctx.arc((7 * this.width / 8), this.height / 2, 70, seconds != 0 ? (3 * Math.PI / 2) + (seconds * 2 * Math.PI / 60) : (3 * Math.PI / 2) + (2 * Math.PI), 3 * Math.PI / 2);
                        ctx.arc((7 * this.width / 8), this.height / 2, 70, (3 * Math.PI / 2) + (2 * Math.PI) + (seconds * 2 * Math.PI / 60), 3 * Math.PI / 2);
                        ctx.stroke();

                        /** Foreground arc End */

                        /** Arc End */
                    }
                    else {
                        ctx.fillText(days, this.width / 6, this.timeStartHeight);
                        ctx.fillText(hours, this.width / 2, this.timeStartHeight);
                        ctx.fillText(minutes, 5 * this.width / 6, this.timeStartHeight);

                        
                        let fontWeight = "bold"
                        // let fontSize = Math.floor(this.width / 10) + 'px';
                        let fontSize = this.timeWordsFontSize + 'px';
                        let fontFamily = this.fontFamily; // monospace works slightly better
                        
                        // set the font style
                        ctx.font = [fontWeight, fontSize, fontFamily].join(' ');
                        
                        ctx.fillText(days < 2 ? this.daysText.slice(0, -1) : this.daysText, this.width / 6, this.textStartHeight);
                        ctx.fillText(hours < 2 ? this.hoursText.slice(0, -1) : this.hoursText, this.width / 2, this.textStartHeight);
                        ctx.fillText(minutes < 2 ? this.minsText.slice(0, -1) : this.minsText, 5 * this.width / 6, this.textStartHeight);

                        // ctx.strokeStyle = this.strokColor1;
                        // ctx.beginPath();
                        // ctx.moveTo(this.width / 2 - 65, 20);
                        // ctx.lineTo(this.width / 2 - 65, 120);
                        // ctx.stroke();

                        
                        // ctx.beginPath();
                        // ctx.moveTo(this.width / 2 + 65, 20);
                        // ctx.lineTo(this.width / 2 + 65, 120);
                        // ctx.stroke();

                        /** Arc Start */

                        /** Background arc Start */
                        ctx.strokeStyle = this.strokColor2;
                        ctx.lineWidth = 7;
                        ctx.beginPath();
                        ctx.arc(this.width / 6, this.height / 2, 70, 0, 2 * Math.PI);
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.arc((this.width / 2), this.height / 2, 70, 0, 2 * Math.PI);
                        ctx.stroke();

                        
                        ctx.beginPath();
                        ctx.arc((5 * this.width / 6), this.height / 2, 70, 0, 2 * Math.PI);
                        ctx.stroke();

                        /** Background arc End */

                        /** Foreground arc Start */

                        ctx.strokeStyle = this.strokColor1;
                        ctx.lineWidth = 7.8;
                        ctx.beginPath();
                        ctx.arc(this.width / 6, this.height / 2, 70, (3 * Math.PI / 2) + (2 * Math.PI) + (days * 2 * Math.PI / 100), 3 * Math.PI / 2);
                        ctx.stroke();

                        
                        ctx.beginPath();
                        ctx.arc(this.width / 2, this.height / 2, 70, (3 * Math.PI / 2) + (2 * Math.PI) + (hours * 2 * Math.PI / 24), 3 * Math.PI / 2);
                        ctx.stroke();

                        
                        ctx.beginPath();
                        ctx.arc((5 * this.width / 6), this.height / 2, 70, (3 * Math.PI / 2) + (2 * Math.PI) + (minutes * 2 * Math.PI / 60), 3 * Math.PI / 2);
                        ctx.stroke();

                        /** Foreground arc End */

                        /** Arc End */
                    }
                    /**Custom Start */
                    

                    ctx.fillStyle = this.textColor;
                    
                    fontWeight = "bold"
                    // let fontSize = Math.floor(this.width / 10) + 'px';
                    fontSize = this.timeFontSize + 'px';
                    fontFamily = this.fontFamily; // monospace works slightly better
                    
                    // set the font style
                    ctx.font = [fontWeight, fontSize, fontFamily].join(' ');
                }
                else {
                    ctx.fillText(this.expiredText, this.halfWidth, this.halfHeight);
                }
                // let fontSize = Math.floor(this.width / 6) + 'px';
                // let fontFamily = 'Courier New'; // monospace works slightly better
                
                // // set the font style
                // ctx.font = [fontSize, fontFamily].join(' ');
                // // ctx.textAlign = 'center';
                // // ctx.textBaseline = 'middle';
                // ctx.fillText(days, 4, 5);

                /**Custom End */
                
                // add finalised frame to the gif
                enc.addFrame(ctx);
                
                // remove a second for the next loop
                timeResult.subtract(1, 'seconds');
            }
        } else {
            // Date has passed so only using a string
            // BG
            ctx.fillStyle = this.bg;
            ctx.fillRect(0, 0, this.width, this.height);

            fontWeight = "bold"
            // let fontSize = Math.floor(this.width / 10) + 'px';
            fontSize = this.experiedTextFontSize + 'px';
            fontFamily = this.fontFamily; // monospace works slightly better
            
            // set the font style
            ctx.font = [fontWeight, fontSize, fontFamily].join(' ');

            // Text
            ctx.fillStyle = this.textColor;
            ctx.fillText(this.expiredText, this.halfWidth, this.halfHeight);
            enc.addFrame(ctx);
            
        }
        
        // finish the gif
        enc.finish();
    }
};
