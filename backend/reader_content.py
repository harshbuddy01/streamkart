"""Sample chapter content generator for the StreamKart reader.

In production this would pull licensed full-text or audio from publishers.
Here we produce evocative, on-genre demo prose so the reader UI feels real.
"""

# A small public-domain MP3 demo to back the audiobook player UI.
# Replace with publisher-served audio in production.
DEMO_AUDIO_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"


# A handful of evocative atmosphere fragments per genre, woven into chapters.
GENRE_FRAGMENTS = {
    "Literary Fiction": [
        "The morning arrived without ceremony. Outside, the city was already humming a private tune, and inside the room the light fell on objects she had stopped noticing — the small clay bowl, the chipped saucer, the book with its spine cracked in three places.",
        "He understood, only later, that there are some silences that are gifts and others that are debts you spend a lifetime repaying.",
        "She thought about her grandmother's kitchen, the smell of tamarind and cardamom, the radio that always played something almost in tune.",
        "Time, in that house, behaved like water — sometimes pooling, sometimes rushing — but never, in the strict sense, passing.",
    ],
    "Magical Realism": [
        "On the seventh day the rain turned blue, and the children stood in it with their mouths open, drinking the colour of distance.",
        "The old man's beard, they said, contained a small flock of starlings that emerged at dusk and returned by dawn, each one carrying a syllable of his sleep.",
        "The mirror in the hallway had not reflected the family for seventy-three years, only the room behind them, only the chair, only the empty shape where someone might one day choose to sit.",
    ],
    "Mystery": [
        "The library was darker than it should have been. Even the dust seemed to hesitate before settling.",
        "He counted the footprints again — eight in, four out — and felt the cold begin to climb the inside of his coat.",
        "Whoever had been there had taken great care to leave nothing, which was, of course, exactly the kind of care that left a great deal.",
    ],
    "Horror": [
        "The hotel was empty, but the carpet remembered everyone who had ever walked it, and tonight it was remembering very loudly.",
        "He told himself the noise was the boiler. The boiler had been turned off in 1971.",
        "When the elevator opened on the fourth floor she could see, in the brass, a face that was not behind her.",
    ],
    "Historical Fiction": [
        "By the third winter of the war, even the bread had grown patient, learning to last twice as long as it had any right to.",
        "She kept her mother's letters in the seam of her coat. They weighed almost nothing and yet shifted the way she walked.",
        "On the platform, no one waved. They had all learned the shape of a wave that means goodbye for a season and the shape that means goodbye forever, and they had stopped using either.",
    ],
    "Dystopian": [
        "There were thirteen kinds of silence permitted in the Republic. She had memorised twelve.",
        "The window was rectangular and high. It admitted only weather, never news.",
        "Faith, in those days, was a thing you wore close to the chest, like a stolen photograph.",
    ],
    "Non-fiction": [
        "Every revolution begins with a story we tell about ourselves; the only question is whether the story is large enough.",
        "Consider the cup of coffee on your desk. Forty thousand decisions, made by a thousand strangers across four continents, were required to bring it into your hand.",
        "History is rarely the record of what happened. More often it is the record of what we have agreed to remember.",
    ],
    "Science Fiction": [
        "The signal arrived in November. It was, by every measure, a perfectly ordinary number — except that no natural process had produced it for three hundred and seventy-one digits.",
        "She watched the stars from the orbital window and thought, not for the first time, that distance was simply a kind of patience.",
    ],
    "Short Stories": [
        "There is a library in which every book contains every other book, recursively, until the very last word is also the first.",
        "The man asked the librarian for a book that had not yet been written, and after a moment, she nodded and went to find it.",
    ],
    "Comedy": [
        "He was not, by any reasonable definition, lost. He simply did not yet know where he was.",
        "The flight had been delayed by what the pilot, with admirable economy, described as 'an issue'.",
    ],
    "Memoir": [
        "I learned early that the people who love you tell you the truth more than once, and in different rooms.",
        "There is a particular kind of courage required to stand on a stage in front of strangers who know your name.",
    ],
    "Philosophical": [
        "The shepherd had a single rule: that everything you owned should fit on the back of a single horse, and nothing on the horse should weigh more than your reason for owning it.",
    ],
    "Postmodern": [
        "You are about to begin reading a chapter of a book about a chapter of a book. Be warned: the chapter you think you are reading is not the chapter you will finish.",
    ],
    "Contemporary": [
        "The fluorescent light hummed in the same key it had hummed in for nine years. She found, increasingly, that she hummed back.",
    ],
    "International Affairs": [
        "Borders, like sentences, are punctuation. They tell us where to pause, but not, finally, what to think.",
    ],
}


def chapters_for(product: dict) -> list[dict]:
    """Return ~6 demo chapters of sample prose for a book product."""
    genre = product.get("genre", "Literary Fiction")
    fragments = GENRE_FRAGMENTS.get(genre) or GENRE_FRAGMENTS["Literary Fiction"]
    title = product["title"]
    desc = product.get("description", "")
    chapters = []

    chapter_titles = [
        "Chapter 1 — Arrivals",
        "Chapter 2 — A Small Inheritance",
        "Chapter 3 — The Long Afternoon",
        "Chapter 4 — Nightingale",
        "Chapter 5 — What She Said at the Door",
        "Chapter 6 — A Kind of Light",
    ]

    intro = (
        f"This is a free preview of *{title}*. The opening pages below are an evocative "
        f"sample to demonstrate the StreamKart reader. In a production deployment, the "
        f"complete licensed text would appear here for purchasers."
    )

    for i, ct in enumerate(chapter_titles):
        body_paragraphs = [
            f"{intro}" if i == 0 else fragments[i % len(fragments)],
            fragments[(i + 1) % len(fragments)],
            fragments[(i + 2) % len(fragments)],
            (
                f"As the chapter draws toward its hush, the reader returns once more to the "
                f"central image — to {desc.split('.')[0].lower() if desc else 'the quiet weight of the day'} — "
                f"and the page closes, gently, on the next breath."
            ),
        ]
        chapters.append({
            "index": i + 1,
            "title": ct,
            "paragraphs": body_paragraphs,
        })

    return chapters


def reader_payload(product: dict) -> dict:
    """Build the reader payload for either a book or audiobook."""
    if product.get("category") == "audiobook":
        return {
            "kind": "audiobook",
            "audio_url": DEMO_AUDIO_URL,
            "duration": product.get("duration", "—"),
            "tracks": [
                {"index": 1, "title": "Track 1 — Opening", "url": DEMO_AUDIO_URL, "length": "4:30"},
                {"index": 2, "title": "Track 2 — The Garden", "url": DEMO_AUDIO_URL, "length": "5:12"},
                {"index": 3, "title": "Track 3 — Letters from Home", "url": DEMO_AUDIO_URL, "length": "6:08"},
                {"index": 4, "title": "Track 4 — Nightfall", "url": DEMO_AUDIO_URL, "length": "5:44"},
            ],
            "preview_note": (
                "This is a demo audio sample to showcase the StreamKart audiobook player. "
                "In production, the licensed audiobook stream would play here."
            ),
        }
    return {
        "kind": "book",
        "chapters": chapters_for(product),
        "preview_note": (
            "This is a demo reader showing sample prose. In production, the full licensed "
            "text of this title would appear here for purchasers."
        ),
    }
