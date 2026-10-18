// Everything the site says. Every layout renders from this; remove or reorder an entry
// in `sections` and all layouts follow (section numbers, contents and addresses are computed).
//
// In any html string: {people:a,b} becomes linked names from `people`, {sec} the section number.
// A section with "from" instead of "html" is built from that table (see BUILD in render.js).
// `research` is grouped by status (in progress, under review, published), newest first in each;
// its `papers` are the publications. `projects` show `image` (a screenshot or logo) when they have one.
var SITE = {
  "part": "AJC-1",
  "name": "André Costa",
  "kind": "Concurrent-systems researcher",
  "photo": {
    "src": "photo.jpg",
    "alt": "Photo of André Costa",
    "width": 240,
    "height": 254
  },
  "lede": "PhD student in computer science at <a href=\"https://www.cmu.edu/\" target=\"_blank\" rel=\"noopener\">Carnegie Mellon University</a> and <a href=\"https://www.fct.unl.pt/\" target=\"_blank\" rel=\"noopener\">NOVA School of Science and Technology</a> (CMU Portugal dual degree), advised by {people:blelloch,lourenco}. I make concurrent data structures faster and easier to use by working on what they sit on: memory allocators, memory reclamation and transactional memory.",
  "facts": [
    [
      "Doc",
      "AJC-1-DS"
    ],
    [
      "Status",
      "<span class=\"tag tag-live\">Active</span>"
    ],
    [
      "Loc",
      "Lisbon · Pittsburgh"
    ]
  ],
  "contacts": [
    {
      "email": ["aj.costa", "campus.fct.unl", "pt"]
    },
    {
      "label": "CV (PDF)",
      "url": "cv.pdf"
    },
    {
      "label": "Google Scholar",
      "url": "https://scholar.google.com/citations?user=pdaPYPQAAAAJ"
    },
    {
      "label": "github.com/ajccosta",
      "url": "https://github.com/ajccosta"
    },
    {
      "label": "LinkedIn",
      "url": "https://www.linkedin.com/in/andr%C3%A9-costa-4236811ba/"
    },
    {
      "label": "ORCID",
      "url": "https://orcid.org/0009-0008-4998-1352"
    }
  ],
  "foot": [
    "ajccosta.github.io",
    "October 18, 2026",
    "ajccosta.github.io"
  ],
  "people": {
    "me": {
      "name": "André Costa",
      "url": ""
    },
    "blelloch": {
      "name": "Guy E. Blelloch",
      "url": "https://www.cs.cmu.edu/~guyb/"
    },
    "lourenco": {
      "name": "João M. Lourenço",
      "url": "https://www.joaomlourenco.org/"
    },
    "preguica": {
      "name": "Nuno M. Preguiça",
      "url": "https://asc.di.fct.unl.pt/~nmp/"
    },
    "kent": {
      "name": "Zachary Kent",
      "url": "https://zachary-kent.github.io/"
    },
    "pires": {
      "name": "Samuel C. Fernão Pires",
      "url": ""
    }
  },
  "research": [
    {
      "id": "r-deqalloc",
      "name": "deqalloc",
      "summary": "Concurrent memory allocator",
      "status": "review",
      "year": 2026,
      "text": "A memory allocator built for concurrent data structures. In most allocators, when one thread frees memory that another thread allocated, the memory is sent back to its owner (a <em>remote free</em>), and under contention that is expensive. deqalloc never returns it. Each thread keeps freed memory locally, and threads that run out steal it from others through work-stealing deques. Across 9 concurrent data structures and 9 memory reclamation schemes, it matches or beats state-of-the-art allocators.",
      "meta": [
        [
          "Lang",
          "C++"
        ],
        [
          "Code",
          "<a href=\"https://github.com/ajccosta/deqalloc\" target=\"_blank\" rel=\"noopener\">github.com/ajccosta/deqalloc</a>"
        ]
      ],
      "papers": [
        {
          "title": "deqalloc: the memory-stealing allocator",
          "authors": [
            "me",
            "blelloch",
            "lourenco",
            "kent"
          ],
          "venue": "Under review",
          "short": "Review",
          "links": []
        }
      ]
    },
    {
      "id": "r-ustm",
      "name": "uSTM",
      "summary": "Software transactional memory",
      "status": "published",
      "year": 2026,
      "text": "A lightweight, efficient software transactional memory that supports general types and <em>deferred aborts</em>: a transaction that conflicts still runs to completion and aborts at the end. Code inside a transaction therefore never stops halfway, which avoids the leaks and bugs that mid-transaction aborts cause, while performance stays competitive with hand-written concurrent code.",
      "meta": [
        [
          "Lang",
          "C++"
        ],
        [
          "Code",
          "<a href=\"https://github.com/cmuparlay/ustm\" target=\"_blank\" rel=\"noopener\">github.com/cmuparlay/ustm</a>"
        ]
      ],
      "papers": [
        {
          "title": "uSTM: A Lightweight and Efficient STM Supporting General Types and Deferred Aborts",
          "authors": [
            "kent",
            "blelloch",
            "me"
          ],
          "venue": "38th ACM Symposium on Parallelism in Algorithms and Architectures, pp. 102–115",
          "short": "SPAA '26",
          "links": [
            [
              "DOI",
              "https://doi.org/10.1145/3816782.3819198"
            ]
          ]
        }
      ]
    },
    {
      "id": "r-harp",
      "name": "HARP: Hazard Region Pointers",
      "summary": "Safe memory reclamation",
      "status": "wip",
      "year": 2026,
      "text": "A safe memory reclamation scheme that protects <em>regions</em> of nodes instead of individual nodes. Hazard pointers bound memory use but are slow; epoch-based reclamation is fast but one stalled thread can make memory grow without limit. HARP aims for both: bounded memory at close to epoch-based speed, without relying on non-portable mechanisms such as OS signals.",
      "meta": [
        [
          "Lang",
          "C++"
        ],
        [
          "Code",
          "<span class=\"unreleased\">Not released yet</span>"
        ]
      ]
    },
    {
      "id": "r-htap",
      "name": "HTAP over concurrent data structures",
      "summary": "Analytics over concurrent indexes",
      "status": "wip",
      "year": 2026,
      "text": "Hybrid transactional/analytical processing: TPC-H tables loaded into nested, concurrent B-tree indexes, built in parallel with ParlayLib and updated through uSTM transactions. The goal is interfaces that let concurrent data structures answer analytical queries while updates keep running.",
      "meta": [
        [
          "Lang",
          "C++"
        ],
        [
          "Code",
          "<span class=\"unreleased\">Not released yet</span>"
        ]
      ]
    },
    {
      "id": "r-fleec",
      "name": "FLeeC &amp; FLeeC+",
      "summary": "Lock-free application cache",
      "status": "published",
      "year": 2026,
      "text": "FLeeC, from my MSc thesis, is a lock-free drop-in replacement for Memcached. FLeeC+, from an MSc thesis I co-advised, makes every core component non-blocking. It uses immutable array-based hash buckets, so reads need no synchronization at all, and it matches or beats Memcached under every workload.",
      "meta": [
        [
          "Lang",
          "C"
        ],
        [
          "Thesis",
          "<a href=\"http://hdl.handle.net/10362/165841\" target=\"_blank\" rel=\"noopener\">FLeeC: A Fast and Lock-Free Applicational Cache</a>"
        ],
        [
          "Code",
          "<a href=\"https://github.com/ajccosta/FLeeC\" target=\"_blank\" rel=\"noopener\">github.com/ajccosta/FLeeC</a> · <a href=\"https://github.com/samuelcfpires/FLeeC-Plus\" target=\"_blank\" rel=\"noopener\">github.com/samuelcfpires/FLeeC-Plus</a>"
        ]
      ],
      "papers": [
        {
          "title": "FLeeC+: A Fully Lock-Free High-Performance Caching System",
          "authors": [
            "pires",
            "me",
            "lourenco"
          ],
          "venue": "17th Simpósio de Informática",
          "short": "INForum '26",
          "links": []
        },
        {
          "title": "FLeeC: a Fast Lock-Free Application Cache",
          "authors": [
            "me",
            "preguica",
            "lourenco"
          ],
          "venue": "14th Simpósio de Informática, pp. 153–155",
          "short": "INForum '23",
          "links": [
            [
              "arXiv",
              "https://arxiv.org/abs/2406.09428"
            ]
          ]
        }
      ]
    }
  ],
  "projects": [
    {
      "name": "ghdiff",
      "lang": "Go",
      "text": "A terminal diff viewer laid out like GitHub's \"Files changed\" tab: file tree, sticky headers, word-level highlights, and it opens PRs and commits directly.",
      "url": "https://github.com/ajccosta/ghdiff",
      "image": {
        "src": "shots/ghdiff.jpg",
        "alt": "ghdiff showing a Go diff with the file tree on the left",
        "width": 1400,
        "height": 664
      }
    },
    {
      "name": "gh-dash (fork)",
      "lang": "Go",
      "text": "My fork of gh-dash, a terminal dashboard for GitHub pull requests. I added arrow-key navigation between the sections bar, the PR list and the preview, reading a PR one commit at a time, and Approve and Merge buttons. Diffs open in ghdiff, which is told the PR's repo, number and commit, and from the dashboard you can review, comment on and merge PRs.",
      "url": "https://github.com/ajccosta/gh-dash",
      "image": {
        "src": "shots/ghdash.jpg",
        "alt": "gh-dash listing open pull requests, with the preview and its Approve and Merge buttons",
        "width": 1400,
        "height": 771
      }
    },
    {
      "name": "bedel",
      "lang": "Python · Actions",
      "text": "Group registration, per-assignment repositories and deadlines for a course on GitHub. A self-hosted alternative to GitHub Classroom, built only on issues, teams and Actions.",
      "url": "https://ajccosta.github.io/bedel/",
      "image": {
        "src": "shots/bedel.jpg",
        "alt": "bedel's teacher view of each group's progress: activity per day, commits, last work and each member's share (made-up groups)",
        "width": 1100,
        "height": 727
      }
    },
    {
      "name": "glare",
      "lang": "C++ · Metal",
      "text": "Cancels screen glare from lights behind you. The webcam finds the lights and your eyes, predicts where each reflection lands on screen, and corrects that patch so text stays readable. Runs as a native macOS menu-bar app.",
      "url": null,
      "image": null
    },
    {
      "name": "The HighWay",
      "lang": "Unity · C#",
      "text": "A multiplayer racing game where every track is generated from a seed: the road, hills, bridges, chicanes, scenery and skyline. Runs natively on macOS, Android and iPhone, and in the browser.",
      "url": null,
      "image": {
        "src": "shots/highway.jpg",
        "alt": "The HighWay: racing a pack of bots on a generated track, with the track map, position and speed",
        "width": 1100,
        "height": 618
      }
    },
    {
      "name": "Screen Keys",
      "lang": "Objective-C",
      "text": "A macOS menu-bar app: Ctrl+Cmd+arrow slides the front window to the screen in that direction, like Win+Shift+arrow on Windows, keeping its size and place. Ctrl+Option+Cmd+arrow moves every window on a screen. The keys can be rebound, and touchpad gestures are on the way.",
      "url": null,
      "image": null
    },
    {
      "name": "git-folder-kidnap",
      "lang": "Shell",
      "text": "Moves one folder of a git repository, history included, into a new repository using git-filter-repo.",
      "url": "https://github.com/ajccosta/git-folder-kidnap",
      "image": null
    }
  ],
  "sections": [
    {
      "id": "block-diagram",
      "title": "Block diagram",
      "html": "<p class=\"caption-above\">Figure {sec}-1. Concurrent data structures depend on an allocator, a reclamation scheme\n  and a synchronization interface. My PhD work improves each layer, mostly without changing\n  the data structures that use it.</p>\n<figure class=\"blocks\">\n  <div class=\"blk blk-app\">\n    <div class=\"blk-label\">Applications</div>\n    <div class=\"blk-row\">\n      <a class=\"cell\" href=\"#r-fleec\"><b>KV caches</b><small>FLeeC · FLeeC+</small></a>\n      <a class=\"cell\" href=\"#r-htap\"><b>Databases</b><small>HTAP</small></a>\n    </div>\n  </div>\n  <div class=\"bus\" aria-hidden=\"true\"><span></span><span></span></div>\n  <div class=\"blk blk-ds\">\n    <div class=\"blk-label\">Concurrent data structures</div>\n    <div class=\"blk-body mono\">trees · hash tables · skip lists · lists · queues</div>\n  </div>\n  <div class=\"bus three\" aria-hidden=\"true\"><span></span><span></span><span></span></div>\n  <div class=\"blk-row three\">\n    <a class=\"blk cell\" href=\"#r-deqalloc\"><div class=\"blk-label\">Allocation</div><b>deqalloc</b><small>memory stealing</small></a>\n    <a class=\"blk cell\" href=\"#r-harp\"><div class=\"blk-label\">Reclamation</div><b>HARP</b><small>hazard region pointers</small></a>\n    <a class=\"blk cell\" href=\"#r-ustm\"><div class=\"blk-label\">Synchronization</div><b>uSTM</b><small>deferred aborts</small></a>\n  </div>\n</figure>\n  "
    },
    {
      "id": "research",
      "title": "Research",
      "from": "research",
      "note": "Full list on <a href=\"https://scholar.google.com/citations?user=pdaPYPQAAAAJ\" target=\"_blank\" rel=\"noopener\">Google Scholar</a>."
    },
    {
      "id": "projects",
      "title": "Personal projects",
      "from": "projects",
      "caption": "Things I build for myself. Entries marked <span class=\"unreleased\">Not released yet</span> are private for now."
    },
    {
      "id": "teaching",
      "title": "Teaching & service",
      "html": "<div class=\"two-col\">\n  <div>\n    <h3>Teaching assistant, NOVA</h3>\n    <table class=\"spec timing\">\n      <tr><th>Period</th><th>Course</th></tr>\n      <tr><td class=\"mono\">2026 fall</td><td>Cloud Computing (MSc)</td></tr>\n      <tr><td class=\"mono\">2026 spring</td><td>Computer Architecture (BSc)</td></tr>\n      <tr><td class=\"mono\">2025 fall</td><td>Concurrent Systems (MSc)</td></tr>\n      <tr><td class=\"mono\">2022–2024</td><td>Intro programming courses for science &amp; engineering (BSc)</td></tr>\n    </table>\n  </div>\n  <div>\n    <h3>Service &amp; advising</h3>\n    <table class=\"spec\">\n      <tr><th>Role</th><th>Where</th></tr>\n      <tr><td>Shadow PC member</td><td><a href=\"https://spaa.acm.org/\" target=\"_blank\" rel=\"noopener\">SPAA 2027</a></td></tr>\n      <tr><td>MSc co-advisor</td><td>FLeeC+ ({people:pires}), NOVA</td></tr>\n    </table>\n  </div>\n</div>\n  "
    }
  ]
};
