exports.handler = async (event) => {

    
    console.log(JSON.stringify(event));
    if (!event.inline_query) {
        return "not an inline query";
    }
    
    const TG = require("./lib/tg.js");
    const tg = new TG(process.env.TOKEN);
    
    let q = event.inline_query.query;
    let answer = {
        inline_query_id: event.inline_query.id,
        results: [],
        cache_time:1 
    };
    
    if(q.length < 3) {
        answer.cache_time = 300;
        try {
            let r = await tg.answerInlineQuery(answer);
            console.log(JSON.stringify(r));
            return r;
        } catch (e) {
            return JSON.stringify(e);
        }
    }
    
    
    const Cards = require("./cards.js");
    const cardsProvider = new Cards();



    
    try {
        let cards = await cardsProvider.smartSearch(q);

        for (let c of cards) {
            let url = "http://www.shadowera.com/secardbot361/" + c.imageUrl;
            answer.results.push({
                type: "photo",
                id: c.id,
                photo_url: url,
                thumb_url: url,
                photo_width: 344,
                photo_height: 480,
                title: c.name,
                description: c.ability,
                caption: q
            });
        }
        
        console.log(JSON.stringify(answer));

        let r = await tg.answerInlineQuery(answer);

        console.log(JSON.stringify(r));

        return r;
    } catch (e) {
        console.log(JSON.stringify(e));
    }

};