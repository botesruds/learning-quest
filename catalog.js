/* The list of subjects and games on the home screen.
   To add a game: put it in games/<id>/index.html, include ../../shared/family.js,
   save with Family.save("<id>", state, updatedMs), then add one line below. */
window.CATALOG=[
  { subject:"Maths", emoji:"➗", color:"var(--c1)", games:[
    { id:"algebra-quest", title:"Algebra Quest", icon:"🗺️", path:"games/algebra-quest/",
      blurb:"Unit 3, y not x? Five worlds of algebra, from patterns to equations." }
  ]}
  // { subject:"Science", emoji:"🔬", color:"var(--c2)", games:[ { id:"matter-quest", ... } ] },
];
