const request = require("request-promise");
const cheerio = require("cheerio");
const CryptoJS = require('crypto-js');

var express = require('express')
var app = express();

app.get('/user/:id', function (req, res) {
    const { id } = req.params
    async function main() {
        const result = await request.get(`https://brainans.com/user/${id}`);
        const $ = cheerio.load(result);

        let dataFull= []

        let json = {
            status: 200,
            data: dataFull
        };

        // scrape image, caption, url, views
        $('#videos_container .col .content__list.grid.infinite_scroll.cards .content__item.grid-item.card').each(function (i, e) {
            if ($(this).find('.content__img.lazy').attr('src') == undefined) {
                return;
            } 
            if ($(this).find('.content__img.lazy').attr('alt') == undefined) {
                return;
            } 
            if ($(this).find('.content__img-wrap a .video_view_count.bx.bx-show span').text() == undefined) {
                return;
            } 
            if ($(this).find('.content__img-wrap a').attr('href') == undefined) {
                return;
            } 
            url = $(this).find('.content__img-wrap a').attr('href');
            image_src = $(this).find('.content__img.lazy').attr('src');
            alt = $(this).find('.content__img.lazy').attr('alt');
            views = $(this).find('.content__img-wrap a .video_view_count.bx.bx-show span').text();
            dataFull.push({
                thumbnail_src: image_src,
                caption : alt,
                views,
                url
            });
        });

        // get link detail
        // $('#videos_container .col .content__list.grid.infinite_scroll.cards .content__item.grid-item.card').each(function (i, e) {
        //     if ($(this).find('.content__img-wrap a').attr('href') == undefined) {
        //         return;
        //     } 
        //     if ($(this).find('.content__img-wrap a .video_view_count.bx.bx-show span').text() == undefined) {
        //         return;
        //     } 
            
        //     url = $(this).find('.content__img-wrap a').attr('href');
        //     json.data = dataFull.map(v => ({...v, url}))
        // });

        // response
        if (dataFull.length > 0) {
            res.status(200).send(json);
        } else {
            res.status(404).send({status: 404, msg: "Oh uh, something went wrong"});
        }
    }
    main();
})

app.get('/video/:id', function (req, res) {
    const { id } = req.params;

    const decode = (encrypted) => {
        // INIT
        const encoded = encrypted; // Base64 encoded string

        // PROCESS
        const encodedWord = CryptoJS.enc.Base64.parse(encoded); // encodedWord via Base64.parse()
        const decoded = CryptoJS.enc.Utf8.stringify(encodedWord); // decode encodedWord via Utf8.stringify() '75322541'
        return decoded;
    }

    const main = async () => {
        const decrypt = decode(id)
        const result = await request.get(`https://brainans.com/${decrypt}`);
        const $ = cheerio.load(result);

        let dataFull= []

        let json = {
            status: 200,
            data: dataFull
        };

        // get video
        $('.video-container').each(function (i, e) {
            if ($(this).find('.video-player.media-item').attr('src') == undefined) {
                return;
            } 
            if ($(this).find('.video-player.media-item').attr('poster') == undefined) {
                return;
            } 
            video_url = $(this).find('.video-player.media-item').attr('src');
            video_thumbnail = $(this).find('.video-player.media-item').attr('poster');
            dataFull.push({
                video_url,
                video_thumbnail
            });
        });
        
        // response
        if (dataFull.length > 0) {
            res.status(200).send(json);
        } else {
            res.status(404).send({status: 404, msg: "Oh uh, something went wrong"});
        }
    }
    main();
})

// set port, listen for requests
app.listen(process.env.PORT, () => {
    console.log(`server is running on port ${process.env.PORT}`);
  });