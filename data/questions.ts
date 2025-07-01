export interface Question {
    id: string
    question: string
    answers: Array<{
        id: string
        text: string
    }>
    correctAnswer: string
    explanation: string
    image?: string
    metadata: {
        category: string
        licenseType: string
        difficulty: string
        tags: string[]
    }
}

export const questions: Question[] = [
    {
        id: "sbf-001",
        question: "Was ist zu tun, wenn vor Antritt der Fahrt nicht feststeht, wer Schiffsführer ist?",
        answers: [
            {
                id: "A",
                text: "Der verantwortliche Schiffsführer muss bestimmt werden."
            },
            {
                id: "B",
                text: "Der verantwortliche Schiffsführer muss gewählt werden."
            },
            {
                id: "C",
                text: "Ein Inhaber eines Sportbootführerscheins muss die Fahrzeugführung übernehmen."
            },
            {
                id: "D",
                text: "Ein Inhaber eines Sportbootführerscheins muss die Verantwortung übernehmen."
            }
        ],
        correctAnswer: "A",
        explanation: "Vor Fahrtantritt muss eindeutig festgelegt werden, wer die Verantwortung als Schiffsführer trägt.",
        image: undefined,
        metadata: {
            category: "basisfragen",
            licenseType: "both",
            difficulty: "beginner",
            tags: ["schiffsführer", "verantwortung", "fahrtantritt"]
        }
    },
    {
        id: "sbf-002",
        question: "In welchen Fällen darf weder ein Sportboot geführt noch dessen Kurs oder Geschwindigkeit selbstständig bestimmt werden?",
        answers: [
            {
                id: "A",
                text: "Wenn man infolge körperlicher oder geistiger Mängel oder infolge des Genusses alkoholischer Getränke oder anderer berauschender Mittel in der sicheren Führung behindert ist oder wenn eine Blutalkoholkonzentration von 0,5 ‰ oder mehr im Körper vorhanden ist."
            },
            {
                id: "B",
                text: "Wenn man infolge körperlicher oder geistiger Mängel oder infolge des Genusses alkoholischer Getränke oder anderer berauschender Mittel in der sicheren Führung behindert ist oder wenn eine Blutalkoholkonzentration von 0,8 ‰ oder mehr im Körper vorhanden ist."
            },
            {
                id: "C",
                text: "Wenn man infolge körperlicher oder geistiger Mängel oder infolge des Genusses alkoholischer Getränke oder anderer berauschender Mittel in der sicheren Führung behindert ist oder wenn eine Blutalkoholkonzentration von 1,0 ‰ oder mehr im Körper vorhanden ist."
            },
            {
                id: "D",
                text: "Wenn man infolge körperlicher oder geistiger Mängel oder infolge des Genusses alkoholischer Getränke oder anderer berauschender Mittel in der sicheren Führung behindert ist oder wenn eine Blutalkoholkonzentration von 0,3 ‰ oder mehr im Körper vorhanden ist."
            }
        ],
        correctAnswer: "A",
        explanation: "Die Promillegrenze für das Führen von Sportbooten liegt bei 0,5 ‰ Blutalkoholkonzentration.",
        image: undefined,
        metadata: {
            category: "basisfragen",
            licenseType: "both",
            difficulty: "intermediate",
            tags: ["alkohol", "promillegrenze", "fahrtüchtigkeit", "0.5"]
        }
    },
    {
        id: "sbf-003",
        question: "Wann ist ein Fahrzeug in Fahrt?",
        answers: [
            {
                id: "A",
                text: "Wenn es weder vor Anker liegt noch an Land festgemacht ist noch auf Grund sitzt."
            },
            {
                id: "B",
                text: "Wenn es weder vor Anker liegt noch an Land festgemacht ist noch Fahrt über Grund macht."
            },
            {
                id: "C",
                text: "Wenn es weder auf Grund sitzt noch vor Anker liegt noch manövrierbehindert oder manövrierunfähig ist."
            },
            {
                id: "D",
                text: "Wenn es weder an Land festgemacht ist noch vor Anker liegt noch Fahrt durchs Wasser macht."
            }
        ],
        correctAnswer: "A",
        explanation: "Ein Fahrzeug ist in Fahrt, wenn es nicht verankert, festgemacht oder auf Grund gesetzt ist.",
        image: undefined,
        metadata: {
            category: "basisfragen",
            licenseType: "both",
            difficulty: "beginner",
            tags: ["fahrzeug in fahrt", "anker", "festgemacht", "grund"]
        }
    },
    {
        id: "sbf-004",
        question: "Wie lang ist die Dauer eines kurzen Tons (•)?",
        answers: [
            {
                id: "A",
                text: "Etwa 1 Sekunde."
            },
            {
                id: "B",
                text: "Etwa 2 Sekunden."
            },
            {
                id: "C",
                text: "Weniger als 1 Sekunde."
            },
            {
                id: "D",
                text: "Weniger als 4 Sekunden."
            }
        ],
        correctAnswer: "A",
        explanation: "Ein kurzer Ton (•) dauert etwa 1 Sekunde, während ein langer Ton (—) etwa 4 Sekunden dauert.",
        image: undefined,
        metadata: {
            category: "basisfragen",
            licenseType: "both",
            difficulty: "beginner",
            tags: ["schallsignale", "kurzer ton", "dauer"]
        }
    },

    {
        id: "sbf-005",
        question: "Wie lang ist die Dauer eines langen Tons (—)?",
        answers: [
            {
                id: "A",
                text: "Etwa 4 - 6 Sekunden."
            },
            {
                id: "B",
                text: "Etwa 2 - 6 Sekunden."
            },
            {
                id: "C",
                text: "Etwa 1 - 2 Sekunden."
            },
            {
                id: "D",
                text: "Etwa 6 - 8 Sekunden."
            }
        ],
        correctAnswer: "A",
        explanation: "Ein langer Ton (—) dauert etwa 4-6 Sekunden, während ein kurzer Ton (•) etwa 1 Sekunde dauert.",
        image: undefined,
        metadata: {
            category: "basisfragen",
            licenseType: "both",
            difficulty: "beginner",
            tags: ["schallsignale", "langer ton", "dauer"]
        }
    },
    {
        id: "sbf-006",
        question: "Wann gilt ein Fahrzeug unter Segel als Maschinenfahrzeug?",
        answers: [
            {
                id: "A",
                text: "Wenn es gleichzeitig mit Maschinenkraft fährt."
            },
            {
                id: "B",
                text: "Wenn es mit einer Antriebsmaschine ausgerüstet ist."
            },
            {
                id: "C",
                text: "Wenn es durch das Segeln keine Fahrt durchs Wasser macht."
            },
            {
                id: "D",
                text: "Wenn es durch das Segeln keine Fahrt über Grund macht."
            }
        ],
        correctAnswer: "A",
        explanation: "Ein Segelfahrzeug gilt als Maschinenfahrzeug, sobald es gleichzeitig mit Maschinenkraft fährt, unabhängig davon ob die Segel gesetzt sind.",
        image: undefined,
        metadata: {
            category: "basisfragen",
            licenseType: "both",
            difficulty: "intermediate",
            tags: ["segelfahrzeug", "maschinenfahrzeug", "antrieb"]
        }
    },
    {
        id: "sbf-007",
        question: "Welches Signal führt ein Fahrzeug unter Segel, das als Maschinenfahrzeug gilt, zusätzlich am Tage?",
        answers: [
            {
                id: "A",
                text: "Einen schwarzen Kegel, Spitze unten."
            },
            {
                id: "B",
                text: "Einen schwarzen Kegel, Spitze oben."
            },
            {
                id: "C",
                text: "Einen schwarzen Rhombus."
            },
            {
                id: "D",
                text: "Zwei schwarze Bälle senkrecht übereinander."
            }
        ],
        correctAnswer: "A",
        explanation: "Ein Segelfahrzeug, das gleichzeitig mit Maschinenkraft fährt, muss am Tag einen schwarzen Kegel mit der Spitze nach unten führen.",
        image: undefined,
        metadata: {
            category: "basisfragen",
            licenseType: "both",
            difficulty: "intermediate",
            tags: ["tagessignale", "kegel", "maschinenfahrzeug", "segel"]
        }
    },
    {
        id: "sbf-008",
        question: "Welche Seite wird als Luvseite bezeichnet?",
        answers: [
            {
                id: "A",
                text: "Die dem Wind zugekehrte Seite."
            },
            {
                id: "B",
                text: "Die dem Wind abgewandte Seite."
            },
            {
                id: "C",
                text: "Die Seite in Fahrtrichtung rechts."
            },
            {
                id: "D",
                text: "Die Seite in Fahrtrichtung links."
            }
        ],
        correctAnswer: "A",
        explanation: "Luv ist die dem Wind zugekehrte Seite. Der Wind kommt von Luv. Das Gegenteil ist Lee (dem Wind abgewandte Seite).",
        image: undefined,
        metadata: {
            category: "basisfragen",
            licenseType: "both",
            difficulty: "beginner",
            tags: ["luv", "wind", "segeln", "grundlagen"]
        }
    },
    {
        id: "sbf-009",
        question: "Welche Seite wird als Leeseite bezeichnet?",
        answers: [
            {
                id: "A",
                text: "Die dem Wind abgewandte Seite."
            },
            {
                id: "B",
                text: "Die dem Wind zugekehrte Seite."
            },
            {
                id: "C",
                text: "Die Seite in Fahrtrichtung rechts."
            },
            {
                id: "D",
                text: "Die Seite in Fahrtrichtung links."
            }
        ],
        correctAnswer: "A",
        explanation: "Lee ist die dem Wind abgewandte Seite, also die windgeschützte Seite. Das Gegenteil ist Luv (dem Wind zugekehrte Seite).",
        image: undefined,
        metadata: {
            category: "basisfragen",
            licenseType: "both",
            difficulty: "beginner",
            tags: ["lee", "wind", "segeln", "grundlagen"]
        }
    },
    {
        id: "sbf-010",
        question: "Wann müssen die Lichter von Fahrzeugen geführt oder gezeigt werden?",
        answers: [
            {
                id: "A",
                text: "Von Sonnenuntergang bis Sonnenaufgang und bei verminderter Sicht."
            },
            {
                id: "B",
                text: "Von Sonnenaufgang bis Sonnenuntergang und bei verminderter Sicht."
            },
            {
                id: "C",
                text: "Von abends 18:00 Uhr bis morgens 06:00 Uhr und bei verminderter Sicht."
            },
            {
                id: "D",
                text: "Bei Dunkelheit, schlechtem Wetter und verminderter Sicht."
            }
        ],
        correctAnswer: "A",
        explanation: "Lichter müssen von Sonnenuntergang bis Sonnenaufgang und bei verminderter Sicht (z.B. Nebel, Regen) geführt werden.",
        image: undefined,
        metadata: {
            category: "basisfragen",
            licenseType: "both",
            difficulty: "beginner",
            tags: ["lichterführung", "sonnenuntergang", "sicht"]
        }
    },
    {
        id: "sbf-011",
        question: "Wozu dient die Lichterführung?",
        answers: [
            {
                id: "A",
                text: "Sie zeigt Fahrtrichtung und Lage eines Fahrzeugs an."
            },
            {
                id: "B",
                text: "Sie zeigt Kurs und Geschwindigkeit eines Fahrzeugs an."
            },
            {
                id: "C",
                text: "Sie zeigt Fahrtrichtung und Position eines Fahrzeugs an."
            },
            {
                id: "D",
                text: "Sie zeigt Fahrtrichtung und Kurs eines Fahrzeugs an."
            }
        ],
        correctAnswer: "A",
        explanation: "Die Lichterführung zeigt anderen Fahrzeugen die Fahrtrichtung und Lage (z.B. ob es sich um ein Segel- oder Motorboot handelt) an.",
        image: undefined,
        metadata: {
            category: "basisfragen",
            licenseType: "both",
            difficulty: "intermediate",
            tags: ["lichterführung", "fahrtrichtung", "lage"]
        }
    },
    {
        id: "sbf-012",
        question: "Was für eine Laterne kann ein Segelfahrzeug von weniger als 20 m Länge anstelle der Seitenlichter und des Hecklichtes führen?",
        answers: [
            {
                id: "A",
                text: "Eine Dreifarbenlaterne an oder nahe der Mastspitze."
            },
            {
                id: "B",
                text: "Eine Zweifarbenlaterne an gut sichtbarer Stelle."
            },
            {
                id: "C",
                text: "Eine Dreifarbenlaterne an gut sichtbarer Stelle."
            },
            {
                id: "D",
                text: "Eine Zweifarbenlaterne an oder nahe der Mastspitze."
            }
        ],
        correctAnswer: "A",
        explanation: "Segelfahrzeuge unter 20 m können eine Dreifarbenlaterne (rot, grün, weiß) an oder nahe der Mastspitze führen statt der einzelnen Lichter.",
        image: undefined,
        metadata: {
            category: "basisfragen",
            licenseType: "both",
            difficulty: "intermediate",
            tags: ["dreifarbenlaterne", "segelfahrzeug", "mastspitze", "20m"]
        }
    },
    {
        id: "sbf-013",
        question: "Welche Lichter muss ein Fahrzeug unter Segel, das gleichzeitig mit Maschinenkraft fährt, führen?",
        answers: [
            {
                id: "A",
                text: "Die für ein Maschinenfahrzeug vorgeschriebenen Lichter."
            },
            {
                id: "B",
                text: "Die für ein Segelfahrzeug vorgeschriebenen Lichter."
            },
            {
                id: "C",
                text: "Zwei rote Rundumlichter senkrecht übereinander."
            },
            {
                id: "D",
                text: "Seitenlichter rot und grün und ein rotes Rundumlicht."
            }
        ],
        correctAnswer: "A",
        explanation: "Sobald ein Segelfahrzeug zusätzlich mit Maschinenkraft fährt, gilt es als Maschinenfahrzeug und muss die entsprechenden Lichter führen.",
        image: undefined,
        metadata: {
            category: "basisfragen",
            licenseType: "both",
            difficulty: "intermediate",
            tags: ["maschinenfahrzeug", "lichter", "segel", "motor"]
        }
    },
    {
        id: "sbf-014",
        question: "Wie weichen zwei Motorboote aus, die sich auf entgegengesetzten Kursen nähern?",
        answers: [
            {
                id: "A",
                text: "Jedes Fahrzeug muss seinen Kurs nach Steuerbord ändern."
            },
            {
                id: "B",
                text: "Jedes Fahrzeug muss seinen Kurs nach Backbord ändern."
            },
            {
                id: "C",
                text: "Es muss das luvwärtige Fahrzeug dem leewärtigen Fahrzeug ausweichen."
            },
            {
                id: "D",
                text: "Es muss das leewärtige Fahrzeug dem luvwärtigen Fahrzeug ausweichen."
            }
        ],
        correctAnswer: "A",
        explanation: "Bei entgegengesetzten Kursen muss jedes Fahrzeug nach Steuerbord (rechts) ausweichen, so dass sie sich an Backbord (links) passieren.",
        image: undefined,
        metadata: {
            category: "basisfragen",
            licenseType: "both",
            difficulty: "intermediate",
            tags: ["ausweichregeln", "steuerbord", "entgegenkommend"]
        }
    },
    {
        id: "sbf-015",
        question: "Zwei Motorboote nähern sich auf kreuzenden Kursen. Es besteht die Gefahr eines Zusammenstoßes. Wer ist ausweichpflichtig?",
        answers: [
            {
                id: "A",
                text: "Dasjenige Fahrzeug muss ausweichen, welches das Andere an seiner Steuerbordseite hat."
            },
            {
                id: "B",
                text: "Dasjenige Fahrzeug muss ausweichen, welches das Andere an seiner Backbordseite hat."
            },
            {
                id: "C",
                text: "Es muss das luvwärtige Fahrzeug dem leewärtigen Fahrzeug ausweichen."
            },
            {
                id: "D",
                text: "Es muss das leewärtige Fahrzeug dem luvwärtigen Fahrzeug ausweichen."
            }
        ],
        correctAnswer: "A",
        explanation: "Bei kreuzenden Kursen ist das Fahrzeug ausweichpflichtig, das das andere an seiner Steuerbordseite (rechts) hat. Merkspruch: 'Steuerbord weicht aus'.",
        image: undefined,
        metadata: {
            category: "basisfragen",
            licenseType: "both",
            difficulty: "intermediate",
            tags: ["ausweichregeln", "kreuzende kurse", "steuerbord"]
        }
    }

]
