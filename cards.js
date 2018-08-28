const fs = require('fs');

module.exports = class Cards {

    constructor(cardsFile = 'secards.360m.shadowera.json') {
        this.cardsJsonFile = cardsFile;



        this.attributes = {

            classes: [
                'warrior',
                'mage',
                'hunter',
                'priest',
                'rogue',
                'wulven',
                'elemental'
            ],
            faction: ['human', 'shadow', 'neutral'],
            type: ['ally', 'item', 'ability', 'location', 'hero'],
            subtype: [
                'wild',
                'outlaw',
                'aldmor',
                'artifact',
                'support',
                'wulven',
                'twilight',
                'homunculus',
                'templar',
                'ravager',
                'undead',
                'attachment',
                'yari',
                'trap',
                'armor',
                'weapon',
                'krugal',
                'balor',
                'scheuth',
                'thriss',
                'tinnal',
                'ogmaga'
            ],

            attacktype: [
                'sword',
                'claw',
                'electric',
                'ice',
                'fire',
                'bow',
                'arcane'
            ],
            rarity: ['uncommon', 'rare', 'common', 'epic', 'legendary']
        }

    }

    getAllCards() {
        return new Promise((resolve, reject) => {
            fs.readFile(this.cardsJsonFile, 'utf8', function (err, data) {
                if (err) {
                    reject(err);
                    return;
                }
                let cards = [];
                try {
                    cards = JSON.parse(data);
                } catch (err) {
                    reject(err);
                    return;
                }
                resolve(cards);
            });
        });
    }

    filterCardsByName(query, maxcards = 50) {
        return new Promise((resolve, reject) => {
            this.getAllCards()
                .then(allCards => {
                    let matches = [];
                    let needle = query.toLowerCase();
                    for (let c of allCards) {
                        let name = c.name.toLowerCase();
                        if (name.indexOf(needle) > -1) {

                            matches.push(c);
                            if (matches.length >= maxcards) break;
                            continue;
                        }
                    }
                    resolve(matches);
                })
                .catch(err => reject(err));
        });
    }

    filterByName(allCards, query, maxCards = 50) {
        let matches = [];
        let needle = query.toLowerCase();
        let foundedCardsNum = 0;
        for (let card of allCards) {

            // if the query word is not a part of this card name, check next card
            if (card.name.toLowerCase().indexOf(needle) === -1) continue;

            matches.push(card);

            if (++foundedCardsNum >= maxCards) break;
        }
        return matches;
    }

    filterCards(cards, filters, maxCards = 50) {
        let foundedCardsNum = 0;
        let matches = [];
        cardloop: for (let card of cards) {
            for (let filter of filters) {
                let filterPassed = false;
                if (card[filter.attribute] === "classes") {
                    filterPassed = card[filter.attribute].toLowerCase().indexOf(filter.value) === -1;
                } else {
                    filterPassed = card[filter.attribute].toLowerCase() === filter.value;
                }

                if (!filterPassed) continue cardloop;
            }
            // if we are here, all filters are succeded for this card
            matches.push(card);

            if (++foundedCardsNum >= maxCards) break;
        }

        return matches;
    }

    createFilters(keywords) {

        let filters = [];


        ///cross search for attributes filters
        attrloop: for (let attributeName in this.attributes) {
            for (let attributeValue of this.attributes[attributeName]) {
                let index = keywords.indexOf(attributeValue);
                if (index === -1) continue;
                filters.push({
                    attribute: attributeName,
                    value: attributeValue
                });
                //keywords.splice(index, 1);
                keywords.replace(attributeValue, "");
                continue attrloop;
            }
        }

        /// special case for wulven class and vulwen subtype ambiguity
        /// user should type wulven 2 times in order to get subtype filtering apply instead of class
        let wulvenCount = 0;
        let wulvenClassFiltersIndex = 0;
        for (let i = 0; i < filters.length; i++) {
            if (filters[i].value === "wulven") {
                if (++wulvenCount === 1) {
                    wulvenClassFiltersIndex = i;

                }
                if (wulvenCount == 2) {
                    break;
                }
            }
        }
        if (wulvenCount > 1) {
            filters.splice(wulvenClassFiltersIndex, 1);
        }
        /// end special wulven case

        return filters;
    }



    async smartSearch(query, maxCards = 50) {
        let allCards = await this.getAllCards();

        let q = query.trim().toLowerCase();
        let keywords = q.split(" ");

        let foiledWordIndex = q.indexOf("foil");
        let foiled = false;
        if (foiledWordIndex > -1) {
            foiled = true;
            q = q.replace("foil", "").trim();
            keywords.splice(foiledWordIndex, 1);
        }

        let cards = allCards;

        let numericalFilters = [{
            fullKeywordName: "cost",
            synonims: ["cost", "cc"]
        }, {
            fullKeywordName: "health",
            synonims: ["health", "hp"]
        }, {
            fullKeywordName: "attack",
            synonims: ["attack", "atk"]
        }];


        for (let numFilter of numericalFilters) {

            let indexOfNumericFilter = -1;
            for (let s of numFilter.synonims) {
                if ((indexOfNumericFilter = q.indexOf(s)) > -1) {

                    let operator = q[indexOfNumericFilter + s.length];
                    let operatorIndex = indexOfNumericFilter + s.length + 1;
                    let numericValue = parseInt(q.substr(operatorIndex), 10);
                    if (isNaN(numericValue) === false) {
                        if (operator == ">")
                            cards = cards.filter(c => c[numFilter.fullKeywordName] > numericValue);
                        else if (operator == "<")
                            cards = cards.filter(c => c[numFilter.fullKeywordName] < numericValue);
                        else
                            cards = cards.filter(c => c[numFilter.fullKeywordName] == numericValue);
        
        
                        q = q.replace(s + operator + numericValue, "");
                    }
                    break;
                }
            }

        }


        let filters = this.createFilters(q);



        let matches = [];
        if (filters.length === 0) {
            if (q.length > 2) {
                matches = this.filterByName(cards, q, maxCards);
            } else {
                matches = cards;
            }
        } else {
            matches = this.filterCards(cards, filters, maxCards);
        }

        if (foiled) {
            matches.map(card => card.imageUrl = card.id + "f.jpg");
        }

        return matches;
    }

    /// this method is for developing purposes only
    async printAllCardsAttributes(attributeName) {
        let allCards = await this.getAllCards();
        let attributes = [];
        for (let card of allCards) {
            if (attributes.indexOf(card[attributeName]) === -1) {
                attributes.push(card[attributeName]);
            }
        }
        return attributes;
    }
}