/* The list of subjects and games on the home screen.
   To add a game: put it in games/<id>/index.html, include ../../shared/family.js,
   save with Family.save("<id>", state, updatedMs), then add one line below.
   retired:true keeps a game playable from "For grown-ups" but off the player's home screen. */
window.CATALOG=[
  { subject:"Maths", emoji:"➗", color:"var(--c1)", games:[
    { id:"fort-defence", title:"Fort Defence", icon:"🏰", path:"games/fort-defence/",
      blurb:"Unit 3, y not x? Learn by day, build your fort, defend it at night." },
    // retired: still playable from "For grown-ups", not shown to the player
    { id:"algebra-quest", title:"Algebra Quest", icon:"🗺️", path:"games/algebra-quest/", retired:true,
      blurb:"Unit 3, y not x? Five worlds of algebra, from patterns to equations." }
  ]},
  { subject:"Science", emoji:"🔬", color:"var(--c2)", games:[
    { id:"fort-defence", title:"Fort Defence: Science", icon:"🦠", path:"games/fort-defence/?subject=science",
      blurb:"Unit 2, How are we organised? Cells, bones and muscles. Same fort, new lands." }
  ]},
  // not a game of its own: opens the valley that Fort Defence builds from everything mastered (cta = the button's word)
  { subject:"My Valley", emoji:"🏡", color:"var(--c3)", games:[
    { id:"fort-defence", title:"My Valley", icon:"🏡", path:"games/fort-defence/?valley", cta:"Visit", extra:true,
      blurb:"Everything you master, in every subject, builds something here. Come and see it grow." }
  ]}
];
