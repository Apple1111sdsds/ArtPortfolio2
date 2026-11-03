/* =========================
   PROJECT DATA
========================= */

const projects = {

    "2d": [

{
    title: "Wren Character Design",
    image: "a3.jpg",
    description: "Character design and concept artwork for Wren.",
    link: "#"
},

  {
    title: "2d Gliceria chracter doodle ",
    image: "a7.jpg",
    description: "Gliceria is a character from denouement ",
    link: "#"
},

   {
    title: "Laguna 2d  background design ",
    image: "1a.jpg",
    description: "A concept design for one of the region in Denouement a 2d rpg game",
    link: "#"
},

  {
    title: " Emma 2d chracter doodle ",
    image: "a4.jpg",
    description: "Emma is an NPC from the game Food Cart simulator",
    link: "#"
},

  {
    title: "Mistress of Crepuscule ",
    image: "Mistress of crepuscule_20260828133647.png",
    description: "Main Character of the 2d visual novel game called Denouement the first turning point",
    link: "#"
},

  {
    title: "Miss Blue ",
    image: "orange.png",
    description: "Nothing here",
    link: "#"
},

  {
    title: "(puto)Food 2d Asset ",
    image: "puto.png",
    description: "2d Asset for Food Cart simulator",
    link: "#"
},


  {
    title: "(ihaw ihaw)Food 2d Asset ",
    image: "ihawihaw.png",
    description: "2d Asset for Food Cart simulator",
    link: "#"
},

  {
    title: "Chill",
    image: "Blue.png",
    description: "2d Asset for Food Cart simulator",
    link: "#"
},

  {
    title: "ms. astra",
    image: "Wink.png",
    description: "New artsyle",
    link: "#"
},

  {
    title: "Mistress of Crepuscule ",
    image: "madam.png",
    description: "the mistress of crepuscule doodle",
    link: "#"
},

  {
    title: "(kikiam)Food 2d Asset ",
    image: "kikiam.png",
    description: "2d Asset for Food Cart simulator",
    link: "#"
},

  {
    title: "Mourning sky area concept design",
    image: "sea.jpg",
    description: "2d concept design for mourning sky one of the region in Denouement",
    link: "#"
},


    ],


    "3d": [

        {
            title: "3D Character",
            image: "images/3d-1.png",
            description:
                "A 3D character project.",
            link: "#"
        },

        {
            title: "3D Environment",
            image: "images/3d-2.png",
            description:
                "3D environment artwork.",
            link: "#"
        }

    ],


    "games": [

  {
    title: "Chaotic City",
    image: "3ad.png",
    description: "A roblox Battle royal but instead of just  using a Gun player can use anything martial art,magic,gun whatever they want",
    link: "#"
},

        {
            title: "Game Project 2",
            image: "images/games-2.png",
            description:
                "Another game development project.",
            link: "#"
        }

    ]

};


/* =========================
   GET PAGES
========================= */

const homePage =
    document.getElementById("home");

const categoryPage =
    document.getElementById("category");

const viewerPage =
    document.getElementById("viewer");


/* =========================
   OPEN CATEGORY
========================= */

function openCategory(category) {

    // Hide home
    homePage.classList.remove("active");

    // Show category
    categoryPage.classList.add("active");

    // Get title
    const title =
        document.getElementById("category-title");

    // Set title
    if (category === "2d") {

        title.textContent = "2D Arts";

    } else if (category === "3d") {

        title.textContent = "3D Arts";

    } else if (category === "games") {

        title.textContent = "Games";

    }


    // Get project container

    const grid =
        document.getElementById("project-grid");


    // Clear previous projects

    grid.innerHTML = "";


    // Get projects

    const categoryProjects =
        projects[category];


    // Create cards

    categoryProjects.forEach(
        (project, index) => {

            const card =
                document.createElement("div");

            card.className =
                "project-card";


            card.innerHTML = `

                <img
                    src="${project.image}"
                    alt="${project.title}"
                >

                <h2>
                    ${project.title}
                </h2>

                <p>
                    ${project.description}
                </p>

            `;


            // Clicking project

            card.onclick = function () {

                openViewer(
                    category,
                    index
                );

            };


            grid.appendChild(card);

        }
    );

}


/* =========================
   OPEN PROJECT VIEWER
========================= */

function openViewer(category, index) {

    const project =
        projects[category][index];


    // Hide category page

    categoryPage.classList.remove("active");


    // Show viewer

    viewerPage.classList.add("active");


    // Set image

    document.getElementById(
        "viewer-img"
    ).src = project.image;


    // Set title

    document.getElementById(
        "viewer-title"
    ).textContent = project.title;


    // Set description

    document.getElementById(
        "viewer-description"
    ).textContent =
        project.description;


    // Set link

    document.getElementById(
        "viewer-link"
    ).href = project.link;

}


/* =========================
   CLOSE VIEWER
========================= */

function closeViewer() {

    viewerPage.classList.remove("active");

    categoryPage.classList.add("active");

}


/* =========================
   GO HOME
========================= */

function goHome() {

    categoryPage.classList.remove("active");

    viewerPage.classList.remove("active");

    homePage.classList.add("active");

}