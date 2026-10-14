# Builds cards.json (the 150-card candidate pool) from a snapshot of
# yugiohmeta.com (Duel Links Meta's TCG site) deck-type breakdowns.
# Snapshot: TCG tier list "Last 1 month" as of 2026-10-14 (515 tournament tops;
# current F&L list effective 2026-09-21). Each list below is the "Top Main Deck"
# + "Top Extra Deck" order shown on that deck type's page.
# Tags: [F]=currently Forbidden (excluded), [L1]=Limited, [L2]=Semi-Limited.
#
# To refresh: update SHARE and the lists, then run:  python3 scripts/build_pool_snapshot.py
# (then `npm run setup` to fetch card ids/types/images from the YGOPRODeck API)
import json, re, os

SHARE = {  # % of TCG tops in the last month
    "Elfnote": 17.09, "Dark Magician Chaos Ritual": 11.26, "Kewl Tune": 9.51,
    "Chaos Ritual": 6.21, "Blitzclique": 4.08, "Invoked": 3.88, "Branded": 3.69,
    "Artmage": 3.11, "Sky Striker": 2.91,
}
D = {}
D["Elfnote"] = ("""Elfnote Lucina|Elfnote Regina|Elfnote Power Patron|Elfnote Tinia [L1]|Medius the Pure|Vidolium the Unstable Power Patron of Unity|Elfnotes: Welcome Home|Elfnote Fortuna|Elfnotes: Rhapsodia of Madness|Ash Blossom & Joyous Spring|Prohibited Power Patron Portal - Terminus [L1]|Mulcharmy Fuwalos|Junoldo the Shadespirit Power Patron|Fydraulis Harmonia|Mulcharmy Purulia|Ghost Belle & Haunted Mansion|Droll & Lock Bird [L2]|Ghost Ogre & Snow Rabbit|Called by the Grave [L1]|Bystial Magnamhut [L1]|Effect Veiler|The Fallen & The Virtuous|Jet Synchron|Theorealize|Starjunk Synchron|Theorealize Past Lull|Synchro Emergency|Triple Tactics Talent [L1]|Nibiru, the Primal Being|Dogmatika Ecclesia, the Virtuous""",
"""Elfnote Seraphim Strelitzia|F.A. Dawn Dragster|Crystal Wing Synchro Dragon|Elfnote June Pride|Chaos Angel|Golden Cloud Beast - Malong|Junora the Power Patron of Tuning|Black Rose Dragon|Accel Synchro Stardust Dragon|T.G. Hyper Librarian [L1]|Stardust Dragon|PSY-Framelord Omega [F]|Ravenous Crocodragon Archethys|Wind Pegasus @Ignister|Infernal Strike Fighter|Arcanite Magician|Ruddy Rose Dragon|Psychic End Punisher|Albion the Branded Dragon|Ecclesia and the Dark Dragon|S:P Little Knight|Enigmaster Packbit|Kewl Tune B2B|Accel Synchron|Purification Power Patron|Stardust Dragon - Victim Sanctuary|Despian Luluwalilith|Arms of Genex Return Zero""")
D["Dark Magician Chaos Ritual"] = ("""Griffoh|Mulcharmy Fuwalos|Dark Magical Curtain|Black Chaos|Droll & Lock Bird [L2]|Skull Archfiend of Chaos|Mind Shuffle|Light and Darkness Ritual|The Gaze of Timaeus|Dark Magician|Magicians' Souls|Magician of Dark Chaos - Black Chaos|Ash Blossom & Joyous Spring|Mulcharmy Purulia|Illusion of Chaos|Ragged Records of Rites|Magician's Rod|WANTED: Seeker of Sinful Spoils|Diabellstar the Black Witch|The Hallowed Azamina|Deception of the Sinful Spoils|Dominus Impulse|Mitsurugi Prayers|Dark Magician, the Pharaoh's Servant|Mitsurugi Mirror|Mitsurugi no Mikoto, Saji|Ame no Murakumo no Mitsurugi|Ame no Habakiri no Mitsurugi [L1]|Mitsurugi Ritual|Pre-Preparation of Rites|Mitsurugi no Mikoto, Aramasa|Kuriboh - Multiply!|Called by the Grave [L1]|Dominus Spark|Black Luster Soldier - Soldier of Light and Darkness|Mitsurugi Great Purification|Mitsurugi no Mikoto, Kusanagi|Futsu no Mitama no Mitsurugi|Nibiru, the Primal Being|The Fallen & The Virtuous|Dark Magical Circle|Soul Servant""",
"""Red-Eyes Dark Dragoon|Dark Magician of Destruction|Cross-Sheep|S:P Little Knight|Selene, Queen of the Master Magicians|Charmer Quartet in Bloom|Zenna's Deceiving Doll Maidens|Dharc the Dark Charmer, Gloomy|Cyberse Contract Witch|Azamina Ilia Silvia|Azamina Mu Rcielago|W:P Fancy Ball|Relinquished Anima|Accesscode Talker|I:P Masquerena|Firewall Dragon|Underworld Goddess of the Closed World|Protectcode Talker [F]|A Bao A Qu, the Lightless Shadow|Albion the Branded Dragon|Ecclesia and the Dark Dragon""")
D["Kewl Tune"] = ("""Kewl Tune Rotary [F]|Ash Blossom & Joyous Spring|Kewl Tune Cue|Kewl Tune Synchro|Kewl Tune Reco|Kewl Tune Mix|JJ "Kewl Tune"|Kewl Tune Clip|Synchro Overtake [L1]|Effect Veiler|Ghost Belle & Haunted Mansion|Duelist Genesis|Ghost Ogre & Snow Rabbit|Fydraulis Harmonia|Infinite Impermanence|Pot of Prosperity [L1]|Droll & Lock Bird [L2]|Pot of Desires|The Fallen & The Virtuous|Mulcharmy Fuwalos|Dominus Purge|Called by the Grave [L1]|Bystial Magnamhut [L1]|PSY-Frame Driver|PSY-Framegear Gamma [L1]|Triple Tactics Talent [L1]|PSY-Framegear Delta""",
"""Kewl Tune Track Maker|Kewl Tune Remix|Kewl Tune RS|Kewl Tune Loudness War|Zalen the Shackled Dragon|Kewl Tune B2B|Visas Amritara|Golden Cloud Beast - Malong|Kewl Tune Crackle|Wind Pegasus @Ignister|Super Starslayer TY-PHON - Sky Crisis|Albion the Branded Dragon|Ecclesia and the Dark Dragon|Enigmaster Packbit|Deep Sea Prima Donna|Chaos Angel""")
D["Chaos Ritual"] = ("""Griffoh|Black Chaos|Skull Archfiend of Chaos|Mind Shuffle|Light and Darkness Ritual|Magician of Dark Chaos - Black Chaos|Black Luster Soldier - Soldier of Light and Darkness|Mulcharmy Fuwalos|Ragged Records of Rites|The Fallen & The Virtuous|Fallen of the White Dragon|Incredible Ecclesia, the Virtuous|Celtic Mystic|Fallen of Albaz|Blazing Cartesia, the Virtuous|Called by the Grave [L1]|Branded in High Spirits [L2]|Fydraulis Harmonia|Dogmatika Ecclesia, the Virtuous|Mulcharmy Purulia|Droll & Lock Bird [L2]|Super Polymerization|Ash Blossom & Joyous Spring|Phara the Primordial Goddess|Triple Tactics Talent [L1]|Bystial Magnamhut [L1]|Nadir Servant|Magicians' Souls|Albion the Shrouded Dragon|Branded Fusion [L1]|Nibiru, the Primal Being|Pre-Preparation of Rites|Dogmatika Fleurdelis, the Knighted|Guiding Quem, the Virtuous|Aluber the Jester of Despia|Forbidden Crown|Chaos Magical Hats""",
"""Albion the Branded Dragon|The Dragon that Devours the Dogma|Ecclesia and the Dark Dragon|Rindbrumm the Striking Dragon|Chaos Angel|Granguignol the Dusk Dragon|Mirrorjade the Iceblade Dragon|The Three Champions of Swordsoul|Despian Luluwalilith|Titaniklad the Ash Dragon|Golden Cloud Beast - Malong|Despian Quaeritis|S:P Little Knight|Garura, Wings of Resonant Life|Mixousia the Confounder|Stardust Dragon - Victim Sanctuary|Mudragon of the Swamp|Enigmaster Packbit|Sea Monster of Theseus|The Crimson King|Dark Magician of Destruction|Lubellion the Searing Dragon|Cooky★Yummy Way|Gravity Controller|Albion the Sanctifire Dragon|Stardust Dragon""")
D["Blitzclique"] = ("""Surge Blitzclique|Blitzclique - Breakaway|Grain Blitzclique|Crackle Blitzclique|Whisker Blitzclique|Hideout in the Sky, Coulomb|The Fallen & The Virtuous|Blitzclique Alternator|Emi Blitzclique|Mulcharmy Fuwalos|Ash Blossom & Joyous Spring|Pot of Extravagance|Blitzclique - Steppleader|Pot of Prosperity [L1]|Droll & Lock Bird [L2]|Fydraulis Harmonia|Dominus Purge|Called by the Grave [L1]|Mulcharmy Purulia|Ghost Ogre & Snow Rabbit|Blitzclique Return Stroke|Foolish Burial Goods|Thunder King Rai-Oh|Dimension Shifter [F]|Dogmatika Ecclesia, the Virtuous|Fallen of the White Dragon|Triple Tactics Talent [L1]|Terraforming [L1]|Bystial Magnamhut [L1]|Incredible Ecclesia, the Virtuous""",
"""Albion the Branded Dragon|Super Starslayer TY-PHON - Sky Crisis|The Dragon that Devours the Dogma|Ecclesia and the Dark Dragon|Golden Cloud Beast - Malong|Thunder Dragon Colossus|Wind Pegasus @Ignister|Enigmaster Packbit|Psychic End Punisher|Deep Sea Prima Donna|S:P Little Knight|PSY-Framelord Omega [F]|Alba-Lenatus the Abyss Dragon|Aussa the Earth Charmer, Immovable|Despian Luluwalilith|Garura, Wings of Resonant Life|Number 60: Dugares the Timeless|Mudragon of the Swamp|Mirrorjade the Iceblade Dragon|Rindbrumm the Striking Dragon|The Three Champions of Swordsoul""")
D["Invoked"] = ("""Aleister the Invoker|Aleister the Reminiscent|Sacred Spirit Sword Aiwass|Aiwass, Divine Spirit of the Law|Magical Meltdown|Invocation - "Sword"|Invocation|Virakam, the Divine Spirit of Artifice|Ash Blossom & Joyous Spring|Mulcharmy Fuwalos|Droll & Lock Bird [L2]|Called by the Grave [L1]|Mulcharmy Purulia|Terraforming [L1]|Super Polymerization|Crowley, the Gifted Magistus|Sorcerer of the Swamp|Dimension Shifter [F]|Ghost Belle & Haunted Mansion|Crossout Designator [L1]|Ghost Ogre & Snow Rabbit|Triple Tactics Talent [L1]|Nibiru, the Primal Being|Forbidden Droplet|Gamma Summon""",
"""Hyperinvoked Aeon|Invoked Raidjin|Invoked Sorath|Invoked Baybarron|Invoked Oceanus|Aleister the Invoker of Madness|Invoked Elysium|S:P Little Knight|Invoked Augoeides|Invoked Mechaba|Invoked Caliga|Artemis, the Magistus Moon Maiden|Endymion, the Crescent Magistus|Salamangreat Almiraj|Sea Monster of Theseus|Mixousia the Confounder|Magistus Chorozo|Invoked Magistus Omega|Favorite HERO Shining Flare Wingman|Chaos Angel""")
D["Branded"] = ("""The Fallen & The Virtuous|Branded in High Spirits [L2]|Aluber the Jester of Despia|Blazing Cartesia, the Virtuous|Fallen of the White Dragon|Incredible Ecclesia, the Virtuous|Fallen of Albaz|Guiding Quem, the Virtuous|Branded Fusion [L1]|Mulcharmy Fuwalos|Branded Opening|Tri-Brigade Springans Kitt|Branded Retribution|Droll & Lock Bird [L2]|Dogmatika Ecclesia, the Virtuous|Super Polymerization|Nadir Servant|Albion the Shrouded Dragon|Called by the Grave [L1]|Mulcharmy Purulia|Tri-Brigade Mercourier|Ash Blossom & Joyous Spring|Bystial Magnamhut [L1]|Gold Sarcophagus [L1]|Triple Tactics Talent [L1]|The Golden Swordsoul|Skull Archfiend of Chaos|Magician of Dark Chaos - Black Chaos|Light and Darkness Ritual|Phara the Primordial Goddess|Forbidden Droplet|Ghost Ogre & Snow Rabbit|Springans Kitt|Bystial Saronir|Ghost Belle & Haunted Mansion|Fusion Deployment|The Gaze of Timaeus|Dominus Spark|Radiant Typhoon Vision|Branded in Red""",
"""Albion the Branded Dragon|The Dragon that Devours the Dogma|Granguignol the Dusk Dragon|Titaniklad the Ash Dragon|Mirrorjade the Iceblade Dragon|Rindbrumm the Striking Dragon|Ecclesia and the Dark Dragon|The Three Champions of Swordsoul|Lubellion the Searing Dragon|Mixousia the Confounder|Despian Quaeritis|Hyperinvoked Aeon|Alba-Lenatus the Abyss Dragon|Khaos Starsource Dragon|Borreload Furious Dragon|Secreterion Dragon|Red-Eyes Dark Dragoon|Dark Magician of Destruction""")
D["Artmage"] = ("""Nervedo the Shadebeast Power Patron|Vidolium the Unstable Power Patron of Unity|Pendulum Treasure|Medius the Pure|Prohibited Power Patron Portal - Terminus [L1]|Artmage Power Patron|Artmage Finmel|Jupredo the Shademachine Power Patron|Theorealize Past Lull|Junoldo the Shadespirit Power Patron|Artmage Graflare|Artmage Litera|Artmage Varnish -Alteration-|Artmage Vandalism -Assault-|Artmage Pact -Awakening-|Artmage Impasto -Recapture-|Mulcharmy Fuwalos|Artmage Academic Arcane Arts Acropolis|Called by the Grave [L1]|Droll & Lock Bird [L2]|Plundered Power Patron Plane - Vidolia|Triple Tactics Talent [L1]|Super Polymerization|Pot of Sloth|Shade the Obscure|The Fallen & The Virtuous|Ash Blossom & Joyous Spring|Mulcharmy Purulia|Kuriboh - Multiply!|Forbidden Crown|Theorealize Liberation|Theorealize|Evenly Matched|The Winged Dragon of Ra - Sphere Mode|Triple Tactics Thrust|The Black Goat Laughs""",
"""Artmage Non-Finito|Artmage Diactorus|Nerva the Power Patron of Creation|Junora the Power Patron of Tuning|Varudras, the Final Bringer of the End Times|Beyond the Pendulum|S:P Little Knight|Purification Power Patron|Predaplant Dragostapelia|Charmer Quartet in Bloom|Jupiter the Power Patron of Destruction|Exceed the Pendulum|Sky Striker Ace - Azalea|Relinquished Anima|Albion the Branded Dragon|Ecclesia and the Dark Dragon|W:P Fancy Ball|Chaos Angel|Mixousia the Confounder|Mudragon of the Swamp|Garura, Wings of Resonant Life|Underworld Goddess of the Closed World|Sea Monster of Theseus""")
D["Sky Striker"] = ("""Ash Blossom & Joyous Spring|Sky Striker Ace - Raye|Sky Striker Mobilize - Engage!|Radiant Typhoon Vision|Sky Striker Mobilize - Linkage!|The Fallen & The Virtuous|Sky Striker Mecha - Widow Anchor|Droll & Lock Bird [L2]|Sky Striker Special Maneuver - Lemnisgate!|Sky Striker Ace - Roze|Reinforcement of the Army [L1]|Called by the Grave [L1]|Pot of Desires|Sky Striker Mecha - Shark Cannon|Ghost Belle & Haunted Mansion|Ghost Ogre & Snow Rabbit|Triple Tactics Talent [L1]|Mystical Space Typhoon|Forbidden Crown|Sky Striker Mecha - Hornet Drones [L1]|Pot of Sloth|Forbidden Droplet|Upstart Goblin|Mulcharmy Fuwalos""",
"""Sky Striker Ace - Kagari|Sky Striker Ace = Zero|Albion the Branded Dragon|Sky Striker Ace - Shizuku|Sky Striker Ace - Hayate|Prototype Sky Striker Ace - Amatsu|Sky Striker Ace - Zeke|Sky Striker Ace - Azalea|Sky Striker Ace - Camellia|Ecclesia and the Dark Dragon|S:P Little Knight|The Dragon that Devours the Dogma|Super Starslayer TY-PHON - Sky Crisis""")

POOL_SIZE = 150


def slug(n):
    s = n.lower().replace("★", "-star-").replace("&", "and").replace("@", "at-")
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def build():
    cards, forbidden = {}, set()
    for deck, (main, extra) in D.items():
        for txt in (main, extra):
            items = [x.strip() for x in txt.split("|") if x.strip()]
            n = len(items)
            for r, raw in enumerate(items):
                m = re.match(r"(.*?)\s*\[(F|L1|L2)\]$", raw)
                name, tag = (m.group(1), m.group(2)) if m else (raw, None)
                if tag == "F":
                    forbidden.add(name)
                    continue
                c = cards.setdefault(name, {"name": name, "key": slug(name), "status": "unlimited", "w": {}})
                if tag == "L1":
                    c["status"] = "limited"
                elif tag == "L2" and c["status"] != "limited":
                    c["status"] = "semi"
                w = 1.0 - 0.5 * (r / (n - 1) if n > 1 else 0)  # list position weight 1.0 -> 0.5
                c["w"][deck] = max(w, c["w"].get(deck, 0))
    for c in cards.values():
        c["score"] = sum(SHARE[d] * w for d, w in c["w"].items())
        c["coverage"] = round(sum(SHARE[d] for d in c["w"]), 2)
        c["decks"] = sorted(c["w"], key=lambda d: -SHARE[d])
    ranked = sorted(cards.values(), key=lambda c: (-c["score"], c["name"]))[:POOL_SIZE]
    keys = [c["key"] for c in ranked]
    assert len(set(keys)) == len(keys), "duplicate keys"
    out = {
        "meta": {
            "source": "yugiohmeta.com (Duel Links Meta) TCG tier list + deck-type breakdowns",
            "window": "Last 1 month up to 2026-10-14 (current F&L list effective 2026-09-21)",
            "tops": 515,
            "sampledDeckTypes": SHARE,
            "sampledShare": round(sum(SHARE.values()), 2),
            "generatedAt": "2026-10-14",
            "excludedForbidden": sorted(forbidden),
        },
        "cards": [
            {"rank": i, "key": c["key"], "name": c["name"], "status": c["status"],
             "coverage": c["coverage"], "decks": c["decks"],
             "id": None, "type": None, "frameType": None}
            for i, c in enumerate(ranked, 1)
        ],
    }
    path = os.path.join(os.path.dirname(__file__), "..", "cards.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    return out, len(cards)


if __name__ == "__main__":
    out, total = build()
    print(f"unique cards seen: {total}; pool: {len(out['cards'])}; excluded forbidden: {out['meta']['excludedForbidden']}")
    for c in out["cards"][:12]:
        print(c["rank"], c["name"], c["coverage"], c["status"])
    print("...", out["cards"][-1]["rank"], out["cards"][-1]["name"], out["cards"][-1]["coverage"])
