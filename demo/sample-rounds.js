export const rounds = [
  [
    {
      player1: {
        name: "Player 111",
        winner: true,
        id: 111,
        url: "https://example.com",
        image: "https://flagcdn.com/w20/it.png",
      },
      player2: {
        name: "Player 211",
        id: 211,
        image: "https://flagcdn.com/w20/es.png",
      },
      score: [2, 1],
      status: "final",
    },
    {
      player1: {
        name: "Player 112",
        winner: true,
        id: 112,
        image: "https://flagcdn.com/w20/gb.png",
      },
      player2: { name: "Player 212", id: 212 },
      score: [3, 0],
      status: "final",
    },
    {
      player1: { name: "Player 113", winner: true, id: 113 },
      player2: { name: "Player 213", id: 213 },
      score: [1, 0],
      status: "retired",
    },
    {
      player1: { name: "Player 114", winner: true, id: 114 },
      player2: { name: "Player 214", id: 214 },
      score: [4, 2],
      status: "final",
    },
    {
      player1: { name: "Player 115", id: 115, url: "https://google.com" },
      player2: { name: "Player 215", id: 215 },
      score: [1, 1],
      status: "in_progress",
    },
    {
      player1: { name: "Player 116", winner: true, id: 116 },
      player2: { name: "Player 216", id: 216 },
      score: [1, 0],
      status: "walkover",
    },
    {
      player1: { name: "Player 117", winner: true, id: 117 },
      player2: { name: "Player 217", id: 217 },
      score: [3, 1],
      status: "final",
    },
    {
      player1: { name: "Player 118", id: 118 },
      player2: { name: "Player 218", id: 218 },
      status: "scheduled",
    },
  ],
  [
    {
      player1: { name: "Player 111", winner: true, id: 111 },
      player2: { name: "Player 112", id: 112 },
      score: [
        [6, 4],
        [3, 6],
        [7, 5],
      ],
      scoreType: "sets",
      status: "final",
    },
    {
      player1: {
        name: "Player 113",
        winner: true,
        id: 113,
        image: "https://flagcdn.com/w20/de.png",
      },
      player2: { name: "Player 114", id: 114 },
      score: [2, 1],
      status: "final",
    },
    {
      player1: { name: "Player 115", id: 115 },
      player2: { name: "Player 116", id: 116 },
      status: "scheduled",
    },
    {
      player1: { name: "Player 117", winner: true, id: 117 },
      player2: { name: "Player 218", id: 218 },
      score: [3, 2],
      status: "final",
    },
  ],
  [
    {
      player1: { name: "Player 111", id: 111 },
      player2: { name: "Player 113", winner: true, id: 113 },
      score: [0, 2],
      status: "final",
    },
    {
      player1: { name: "Player 117", id: 117 },
      player2: { name: "Player 115", id: 115 },
      status: "scheduled",
    },
  ],
  [
    {
      player1: { name: "Player 113 Player 113", winner: true, id: 113 },
      player2: { name: "Player 111", id: 111 },
      score: [
        [
          [6, 7],
          [7, 9],
        ],
        [
          [7, 6],
          [7, 2],
        ],
        [6, 3],
      ],
      status: "final",
    },
  ],
  [{ player1: { name: "Player 113", winner: true, id: 113 }, status: "final" }],
];
