// State Management
const state = {
    currentSection: 0,
    sections: [],
    fontSize: 'medium',
    language: 'en'
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initializeSections();
    initializeNavigation();
    initializeTOC();
    initializeTextControls();
    initializeInfoModal();
    initializeLanguageModal();
    checkLanguagePreference(); // This will call updateLanguage() if preference exists
    preventIOSZoom();
});

// Prevent iOS Safari zoom gestures
function preventIOSZoom() {
    let lastTouchEnd = 0;
    
    // Prevent double-tap zoom
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Prevent pinch zoom
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Prevent gesture zoom
    document.addEventListener('gesturestart', (e) => {
        e.preventDefault();
    });
    
    document.addEventListener('gesturechange', (e) => {
        e.preventDefault();
    });
    
    document.addEventListener('gestureend', (e) => {
        e.preventDefault();
    });
}

// Initialize sections
function initializeSections() {
    state.sections = Array.from(document.querySelectorAll('.section'));
    if (state.sections.length > 0) {
        showSection(0);
    }
}

// Get section title
function getSectionTitle(section) {
    const h1 = section.querySelector('h1');
    if (h1) return h1.textContent.trim();
    
    // Get title from TOC link
    const sectionId = section.getAttribute('data-section');
    const tocLink = document.querySelector(`.toc-link[data-section="${sectionId}"]`);
    if (tocLink) {
        return tocLink.textContent.trim();
    }
    
    return 'Table of Contents';
}

// Update TOC label with current section title
function updateTOCLabel() {
    const tocLabel = document.querySelector('.toc-label');
    const currentSection = state.sections[state.currentSection];
    if (tocLabel && currentSection) {
        tocLabel.textContent = getSectionTitle(currentSection);
    }
}

// Show specific section
function showSection(index) {
    if (index < 0 || index >= state.sections.length) return;
    
    // Hide all sections
    state.sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    state.sections[index].classList.add('active');
    state.currentSection = index;
    
    // Update TOC active state
    updateTOCActive();
    
    // Update TOC label with section title
    updateTOCLabel();
    
    // Update navigation buttons
    updateNavigationButtons();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Navigation functions
function initializeNavigation() {
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    
    prevButton.addEventListener('click', () => {
        if (state.currentSection > 0) {
            showSection(state.currentSection - 1);
        }
    });
    
    nextButton.addEventListener('click', () => {
        if (state.currentSection < state.sections.length - 1) {
            showSection(state.currentSection + 1);
        }
    });
    
    updateNavigationButtons();
}

function updateNavigationButtons() {
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    
    prevButton.disabled = state.currentSection === 0;
    nextButton.disabled = state.currentSection === state.sections.length - 1;
}

// Table of Contents functions
function initializeTOC() {
    const tocToggle = document.getElementById('tocToggle');
    const tocDropdown = document.getElementById('tocDropdown');
    const tocLinks = document.querySelectorAll('.toc-link');
    
    // Toggle dropdown
    tocToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        tocDropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!tocToggle.contains(e.target) && !tocDropdown.contains(e.target)) {
            tocDropdown.classList.remove('active');
        }
    });
    
    // Handle TOC link clicks
    tocLinks.forEach((link, index) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            const sectionIndex = state.sections.findIndex(
                section => section.getAttribute('data-section') === sectionId
            );
            
            if (sectionIndex !== -1) {
                showSection(sectionIndex);
                tocDropdown.classList.remove('active');
            }
        });
    });
    
    updateTOCActive();
}

function updateTOCActive() {
    const tocLinks = document.querySelectorAll('.toc-link');
    const currentSectionId = state.sections[state.currentSection]?.getAttribute('data-section');
    
    tocLinks.forEach(link => {
        if (link.getAttribute('data-section') === currentSectionId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Text Controls functions
function initializeTextControls() {
    const textControlToggle = document.getElementById('textControlToggle');
    const textControlMenu = document.getElementById('textControlMenu');
    const fontSizeButtons = document.querySelectorAll('.font-size-btn');
    const languageButtons = document.querySelectorAll('.language-btn');
    
    // Toggle menu
    textControlToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        textControlMenu.classList.toggle('active');
        textControlToggle.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!textControlToggle.contains(e.target) && !textControlMenu.contains(e.target)) {
            textControlMenu.classList.remove('active');
            textControlToggle.classList.remove('active');
        }
    });
    
    // Font size controls
    fontSizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            fontSizeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const size = button.getAttribute('data-size');
            setFontSize(size);
        });
    });
    
    // Language controls
    languageButtons.forEach(button => {
        button.addEventListener('click', () => {
            languageButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const lang = button.getAttribute('data-lang');
            setLanguage(lang);
        });
    });
}

function setFontSize(size) {
    state.fontSize = size;
    document.body.className = document.body.className.replace(/font-\w+/g, '');
    if (size !== 'medium') {
        document.body.classList.add(`font-${size}`);
    }
}

// Info Modal functions
function initializeInfoModal() {
    const infoButton = document.getElementById('infoButton');
    const infoModal = document.getElementById('infoModal');
    const modalClose = document.getElementById('modalClose');
    
    if (infoButton && infoModal) {
        infoButton.addEventListener('click', () => {
            infoModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
        
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                closeInfoModal();
            });
        }
        
        // Close modal when clicking outside
        infoModal.addEventListener('click', (e) => {
            if (e.target === infoModal) {
                closeInfoModal();
            }
        });
        
        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && infoModal.classList.contains('active')) {
                closeInfoModal();
            }
        });
    }
}

function closeInfoModal() {
    const infoModal = document.getElementById('infoModal');
    if (infoModal) {
        infoModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// Language Selection Modal functions
function initializeLanguageModal() {
    const languageModal = document.getElementById('languageModal');
    const languageButtons = document.querySelectorAll('.language-option-btn');
    
    if (languageModal && languageButtons.length > 0) {
        languageButtons.forEach(button => {
            button.addEventListener('click', () => {
                const lang = button.getAttribute('data-lang');
                selectLanguage(lang);
            });
        });
    }
}

function checkLanguagePreference() {
    const savedLanguage = localStorage.getItem('voxSacraLanguage');
    const languageModal = document.getElementById('languageModal');
    
    if (savedLanguage) {
        // Language preference already saved, use it
        setLanguage(savedLanguage);
        // Update active button in language controls
        updateLanguageButtons(savedLanguage);
    } else {
        // No preference saved, show language selection modal
        // Set default to English for initial display
        state.language = 'en';
        document.documentElement.setAttribute('lang', 'en');
        updateLanguage();
        if (languageModal) {
            languageModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    }
}

function selectLanguage(lang) {
    const languageModal = document.getElementById('languageModal');
    
    // Set the language
    setLanguage(lang);
    
    // Update active button in language controls
    updateLanguageButtons(lang);
    
    // Close the modal
    if (languageModal) {
        languageModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
}

function updateLanguageButtons(lang) {
    const languageButtons = document.querySelectorAll('.language-btn');
    languageButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
}

// Translations object
const translations = {
    en: {
        'toc-label': 'Table of Contents',
        'toc-cover': 'Cover',
        'toc-prayer-intro': 'Opening Prayer: Introduction',
        'toc-prayer-our-father': 'Opening Prayer: Our Father',
        'toc-prayer-hail-mary': 'Opening Prayer: Hail Mary',
        'toc-prayer-closing': 'Opening Prayer: Closing',
        'toc-reading1': 'Reading I',
        'toc-carol1': 'O Come, O Come, Emmanuel',
        'toc-reading2': 'Reading II',
        'toc-carol2': 'Creator of the Stars of Night',
        'toc-reading3': 'Reading III',
        'toc-carol3': 'Lo, How a Rose E\'er Blooming',
        'toc-reading4': 'Reading IV',
        'toc-carol4': 'Once in Royal David\'s City',
        'toc-reading5': 'Reading V',
        'toc-carol5': 'Ave Maria',
        'toc-reading6': 'Reading VI',
        'toc-carol6': 'Silent Night',
        'toc-reading7': 'Reading VII',
        'toc-carol7': 'Hark! The Herald Angels Sing',
        'toc-reading8': 'Reading VIII',
        'toc-carol8': 'In Dulci Jubilo',
        'toc-reading9': 'Reading IX',
        'toc-carol9': 'O Come, All Ye Faithful',
        'toc-closing': 'Closing Prayer & Final Carol',
        'toc-feedback': 'Feedback',
        'cover-title': 'Lessons & Carols',
        'cover-subtitle': 'Full Program',
        'prayer-intro-title': 'Opening Prayer: Introduction',
        'prayer-our-father-title': 'Opening Prayer: Our Father',
        'prayer-hail-mary-title': 'Opening Prayer: Hail Mary',
        'prayer-closing-title': 'Opening Prayer: Closing',
        'reading1-title': 'Genesis 3:8–15',
        'reading1-subtitle': 'The Fall and the First Promise of Redemption',
        'reading1-text': '<p>When they heard the sound of the LORD God walking about in the garden at the breezy time of the day, the man and his wife hid themselves from the LORD God among the trees of the garden.</p><p>The LORD God then called to the man and asked him: "Where are you?"</p><p>He answered, "I heard you in the garden; but I was afraid, because I was naked, so I hid."</p><p>Then God asked: "Who told you that you were naked? Have you eaten from the tree of which I had forbidden you to eat?"</p><p>The man replied, "The woman whom you put here with me—she gave me fruit from the tree, so I ate it."</p><p>The LORD God then asked the woman: "What is this you have done?" The woman answered, "The snake tricked me, so I ate it."</p><p>Then the LORD God said to the snake:</p><p>"Because you have done this, cursed are you among all the animals, tame or wild; on your belly you shall crawl, and dust you shall eat all the days of your life.</p><p>I will put enmity between you and the woman, and between your offspring and hers; they will strike at your head, while you strike at their heel."</p>',
        'carol1-title': 'O Come, O Come, Emmanuel',
        'carol1-subtitle': '15th Century French melody, arr. David Willcocks',
        'carol1-text': '<p class="refrain"><strong>Rejoice! Rejoice! Emmanuel <br>Shall come to thee, O Israel.</strong></p><p class="verse"><strong>Verse 1</strong>O come, O come, Emmanuel, <br>Redeem thy captive Israel,<br>That into exile drear is gone<br>Far from the face of God\'s dear Son.</p><p class="verse"><strong>Verse 2</strong>O come, thou Branch of Jesse! <br>Draw the quarry from the lion\'s claw;<br>From the dread caverns of the grave, <br>From nether hell, thy people save.</p><p class="verse"><strong>Verse 3</strong>O come, O come, thou Dayspring bright! <br>Pour on our souls thy healing light;<br>Dispel the long night\'s ling\'ring gloom, <br>And pierce the shadows of the tomb.</p><p class="verse"><strong>Verse 4</strong>O come, thou Lord of David\'s Key! <br>The royal door fling wide and free;<br>Safeguard for us the heav\'nward road,<br>And bar the way to death\'s abode.</p><p class="verse"><strong>Verse 5</strong>O come, O come, Adonai, <br>Who in thy glorious majesty<br>From that high mountain clothed with awe <br>Gavest thy folk the elder law.</p>',
        'reading2-title': 'Genesis 22:15–18',
        'reading2-subtitle': 'God\'s Promise to Abraham',
        'reading2-text': '<p>A second time the angel of the LORD called to Abraham from heaven and said:</p><p>"I swear by my very self—oracle of the LORD—that because you acted as you did in not withholding from me your son, your only one, I will bless you and make your descendants as countless as the stars of the sky and the sands of the seashore; your descendants will take possession of the gates of their enemies, and in your descendants all the nations of the earth will find blessing, because you obeyed my command."</p>',
        'carol2-title': 'Creator of the Stars of Night',
        'carol2-subtitle': 'Latin hymn (9th Century)',
        'carol2-text': '<p class="verse"><strong>Verse 1</strong>Creator of the stars of night,<br>Thy people\'s everlasting light,<br>O Christ, thou Saviour of us all,<br>We pray thee, hear us when we call.</p><p class="verse"><strong>Verse 2</strong>To thee the travail deep was known<br>That made the whole creation groan<br>Till thou, Redeemer, shouldest free<br>Thine own in glorious liberty.</p><p class="verse"><strong>Verse 3</strong>When the old world drew on toward night,<br>Thou camest, not in splendor bright<br>As monarch, but the humble child<br>Of Mary, blameless mother mild.</p><p class="verse"><strong>Verse 4</strong>At thy great name of Jesus, now<br>All knees must bend, all hearts must bow:<br>And things celestial thee shall own,<br>And things terrestrial, Lord alone.</p><p class="verse"><strong>Verse 5</strong>Come in thy holy might, we pray;<br>Redeem us for eternal day<br>From every power of darkness, when<br>Thou judgest all the sons of men.</p><p class="verse"><strong>Verse 6</strong>To God the Father, God the Son,<br>And God the Spirit, Three in One,<br>Laud, honor, might, and glory be<br>From age to age eternally.</p>',
        'reading3-title': 'Isaiah 9:1–6',
        'reading3-subtitle': 'The People Who Walked in Darkness Have Seen a Great Light',
        'reading3-text': '<p>The people who walked in darkness have seen a great light; upon those who lived in a land of gloom a light has shone.</p><p>You have brought them abundant joy and great rejoicing; they rejoice before you as people rejoice at harvest, as they exult when dividing the spoils.</p><p>For the yoke that burdened them, the pole on their shoulder, the rod of their taskmaster, you have smashed, as on the day of Midian.</p><p>For every boot that tramped in battle, every cloak rolled in blood, will be burned as fuel for fire.</p><p>For a child is born to us, a son is given to us; upon his shoulder dominion rests. They name him Wonder-Counselor, God-Hero, Father-Forever, Prince of Peace.</p><p>His dominion is vast and forever peaceful, upon David\'s throne, and over his kingdom, which he confirms and sustains by judgment and justice, both now and forever. The zeal of the LORD of hosts will do this!</p>',
        'carol3-title': 'Lo, How a Rose E\'er Blooming',
        'carol3-subtitle': '14th Century German melody',
        'carol3-text': '<p class="verse"><strong>Verse 1</strong>Lo, how a Rose e\'er blooming <br>From tender stem hath sprung!<br>Of Jesse\'s lineage coming, <br>As men of old have sung.<br><br>It came, a flow\'ret bright, <br>Amid the cold of winter, <br>When half-spent was the night.</p><p class="verse"><strong>Verse 2</strong>Isaiah \'twas foretold it, <br>The Rose I have in mind;<br>With Mary we behold it, <br>The Virgin Mother kind.<br><br>To show God\'s love aright, <br>She bore to men a Savior, <br>When half-spent was the night.</p>',
        'reading4-title': 'Isaiah 11:1–9',
        'reading4-subtitle': 'The Peaceable Kingdom',
        'reading4-text': '<p>But a shoot shall sprout from the stump of Jesse, and from his roots a bud shall blossom.</p><p>The spirit of the LORD shall rest upon him: a spirit of wisdom and of understanding, a spirit of counsel and of strength, a spirit of knowledge and of fear of the LORD, and his delight shall be the fear of the LORD.</p><p>Not by appearance shall he judge, nor by hearsay shall he decide, but he shall judge the poor with justice, and decide fairly for the land\'s afflicted. He shall strike the ruthless with the rod of his mouth, and with the breath of his lips he shall slay the wicked.</p><p>Justice shall be the band around his waist, and faithfulness a belt upon his hips.</p><p>Then the wolf shall be a guest of the lamb, and the leopard shall lie down with the young goat; the calf and the young lion shall browse together, with a little child to guide them.</p><p>The cow and the bear shall graze, together their young shall lie down; the lion shall eat hay like the ox.</p><p>The baby shall play by the viper\'s den, and the child lay his hand on the adder\'s lair.</p><p>They shall not harm or destroy on all my holy mountain; for the earth shall be filled with knowledge of the LORD, as water covers the sea.</p>',
        'carol4-title': 'Once in Royal David\'s City',
        'carol4-subtitle': 'H.J. Gauntlett, arr. David Willcocks',
        'carol4-text': '<p class="verse"><strong>Verse 1</strong>Once in royal David\'s city <br>Stood a lowly cattle shed, <br>Where a mother laid her baby <br>In a manger for his bed:<br><br>Mary was that mother mild, <br>Jesus Christ, her little child.</p><p class="verse"><strong>Verse 2</strong>He came down to earth from heaven, <br>Who is God and Lord of all, <br>And his shelter was a stable, <br>And his cradle was a stall; <br><br>With the poor, and mean, and lowly, <br>Lived on earth our Savior holy.</p><p class="verse"><strong>Verse 3</strong>And through all his wondrous childhood <br>He would honor and obey, <br>Love, and watch the lowly maiden, <br>In whose gentle arms he lay:<br><br>Christian children all must be <br>Mild, obedient, good as he.</p><p class="verse"><strong>Verse 4</strong><br>For he is our childhood\'s pattern, <br>Day by day like us he grew, <br>He was little, weak, and helpless, <br>Tears and smiles like us he knew; <br><br>And he feeleth for our sadness, <br>And he shareth in our gladness.</p><p class="verse"><strong>Verse 5</strong>Not in that poor lowly stable, <br>With the oxen standing by, <br>We shall see him; but in heaven, <br>Set at God\'s right hand on high; <br><br>When like stars his children crowned <br>All in white shall wait around.</p>',
        'reading5-title': 'Luke 1:26–38',
        'reading5-subtitle': 'The Annunciation',
        'reading5-text': '<p>In the sixth month, the angel Gabriel was sent from God to a town of Galilee called Nazareth, to a virgin betrothed to a man named Joseph, of the house of David, and the virgin\'s name was Mary.</p><p>And coming to her, he said, "Hail, favored one! The Lord is with you."</p><p>But she was greatly troubled at what was said and pondered what sort of greeting this might be.</p><p>Then the angel said to her, "Do not be afraid, Mary, for you have found favor with God. Behold, you will conceive in your womb and bear a son, and you shall name him Jesus.</p><p>He will be great and will be called Son of the Most High, and the Lord God will give him the throne of David his father, and he will rule over the house of Jacob forever, and of his kingdom there will be no end."</p><p>But Mary said to the angel, "How can this be, since I have no relations with a man?"</p><p>And the angel said to her in reply, "The holy Spirit will come upon you, and the power of the Most High will overshadow you. Therefore the child to be born will be called holy, the Son of God.</p><p>And behold, Elizabeth, your relative, has also conceived a son in her old age, and this is the sixth month for her who was called barren; for nothing will be impossible for God."</p><p>Mary said, "Behold, I am the handmaid of the Lord. May it be done to me according to your word." Then the angel departed from her.</p>',
        'carol5-title': 'Ave Maria',
        'carol5-subtitle': 'Jacques Arcadelt, 16th Century',
        'carol5-text': '<p>Ave Maria, gratia plena,<br>Dominus tecum;<br>benedicta tu in mulieribus,<br>et benedictus fructus ventris tui, Iesus.<br>Sancta Maria, Mater Dei,<br>ora pro nobis peccatoribus,<br>nunc et in hora mortis nostrae.<br>Amen.</p>',
        'reading6-title': 'Matthew 1:18–25',
        'reading6-subtitle': 'The Birth of Jesus Christ',
        'reading6-text': '<p>Now this is how the birth of Jesus Christ came about. When his mother Mary was betrothed to Joseph, but before they lived together, she was found with child through the holy Spirit.</p><p>Joseph her husband, since he was a righteous man, yet unwilling to expose her to shame, decided to divorce her quietly.</p><p>Such was his intention when, behold, the angel of the Lord appeared to him in a dream and said, "Joseph, son of David, do not be afraid to take Mary your wife into your home. For it is through the holy Spirit that this child has been conceived in her.</p><p>She will bear a son and you are to name him Jesus, because he will save his people from their sins."</p><p>All this took place to fulfill what the Lord had said through the prophet: "Behold, the virgin shall be with child and bear a son, and they shall name him Emmanuel," which means "God is with us."</p><p>When Joseph awoke, he did as the angel of the Lord had commanded him and took his wife into his home. He had no relations with her until she bore a son, and he named him Jesus.</p>',
        'carol6-title': 'Silent Night',
        'carol6-subtitle': 'Franz Gruber, arr. John Rutter',
        'carol6-text': '<p class="verse"><strong>Verse 1</strong>Silent night, holy night, <br>All is calm, all is bright, <br>Round yon Virgin, Mother and Child, <br>Holy Infant so tender and mild, <br>Sleep in heavenly peace, <br>Sleep in heavenly peace.</p><p class="verse"><strong>Verse 2</strong>Silent night, holy night, <br>Shepherds quake at the sight; <br>Glories stream from heaven afar, <br>Heav\'nly hosts sing: "Alleluia! <br>Christ the Savior is born! <br>Christ the Savior is born!"</p><p class="verse"><strong>Verse 3</strong>Silent night, holy night, <br>Son of God, love\'s pure light, <br>Radiant beams from thy holy face, <br>With the dawn of redeeming grace, <br>Jesus, Lord, at thy birth, <br>Jesus, Lord, at thy birth.</p>',
        'reading7-title': 'Luke 2:8–20',
        'reading7-subtitle': 'The Birth of Jesus Announced to Shepherds',
        'reading7-text': '<p>Now there were shepherds in that region living in the fields and keeping the night watch over their flock.</p><p>The angel of the Lord appeared to them and the glory of the Lord shone around them, and they were struck with great fear.</p><p>The angel said to them, "Do not be afraid; for behold, I proclaim to you good news of great joy that will be for all the people.</p><p>For today in the city of David a savior has been born for you who is Messiah and Lord.</p><p>And this will be a sign for you: you will find an infant wrapped in swaddling clothes and lying in a manger."</p><p>And suddenly there was a multitude of the heavenly host with the angel, praising God and saying: "Glory to God in the highest and on earth peace to those on whom his favor rests."</p><p>When the angels went away from them to heaven, the shepherds said to one another, "Let us go, then, to Bethlehem to see this thing that has taken place, which the Lord has made known to us."</p><p>So they went in haste and found Mary and Joseph, and the infant lying in the manger.</p><p>When they saw this, they made known the message that had been told them about this child.</p><p>All who heard it were amazed by what had been told them by the shepherds.</p><p>And Mary kept all these things, reflecting on them in her heart.</p><p>Then the shepherds returned, glorifying and praising God for all they had heard and seen, just as it had been told to them.</p>',
        'carol7-title': 'Hark! The Herald Angels Sing',
        'carol7-subtitle': 'Felix Mendelssohn, arr. David Willcocks',
        'carol7-text': '<p class="refrain"><strong>Hark! The hearld angels sing,<br>Glory to the newborn king.</strong></p><p class="verse"><strong>Verse 1</strong>Hark! the herald angels sing, <br>"Glory to the newborn King; <br>Peace on earth, and mercy mild, <br>God and sinners reconciled." <br><br>Joyful, all ye nations, rise, <br>Join the triumph of the skies; <br>With the angelic host proclaim, <br>"Christ is born in Bethlehem!"</p><p class="verse"><strong>Verse 2</strong>Christ, by highest heav\'n adored, <br>Christ, the everlasting Lord, <br>Late in time behold him come, <br>Offspring of a Virgin\'s womb. <br><br>Veiled in flesh, the Godhead see; <br>Hail th\'incarnate Deity, <br>Pleased, as man, with men to dwell, <br>Jesus, our Emmanuel.</p><p class="verse"><strong>Verse 3</strong>Hail! the heav\'n-born Prince of Peace! <br>Hail! the Son of Righteousness! <br>Light and life to all he brings, <br>Ris\'n with healing in his wings. <br><br>Mild he lays his glory by, <br>Born that man no more may die, <br>Born to raise the sons of earth, <br>Born to give them second birth.</p>',
        'reading8-title': 'Matthew 2:1–12',
        'reading8-subtitle': 'The Visit of the Magi',
        'reading8-text': '<p>When Jesus was born in Bethlehem of Judea, in the days of King Herod, behold, magi from the east arrived in Jerusalem, saying, "Where is the newborn king of the Jews? We saw his star at its rising and have come to do him homage."</p><p>When King Herod heard this, he was greatly troubled, and all Jerusalem with him.</p><p>Assembling all the chief priests and the scribes of the people, he inquired of them where the Messiah was to be born.</p><p>They said to him, "In Bethlehem of Judea, for thus it has been written through the prophet: \'And you, Bethlehem, land of Judah, are by no means least among the rulers of Judah; since from you shall come a ruler, who is to shepherd my people Israel.\'"</p><p>Then Herod called the magi secretly and ascertained from them the time of the star\'s appearance.</p><p>He sent them to Bethlehem and said, "Go and search diligently for the child. When you have found him, bring me word, that I too may go and do him homage."</p><p>After their audience with the king they set out. And behold, the star that they had seen at its rising preceded them, until it came and stopped over the place where the child was.</p><p>They were overjoyed at seeing the star, and on entering the house they saw the child with Mary his mother. They prostrated themselves and did him homage.</p><p>Then they opened their treasures and offered him gifts of gold, frankincense, and myrrh.</p><p>And having been warned in a dream not to return to Herod, they departed for their country by another way.</p>',
        'carol8-title': 'In Dulci Jubilo',
        'carol8-subtitle': 'Old German carol, arr. R. L. Pearsall',
        'carol8-text': '<p class="verse"><strong>Verse 1</strong>In dulci jubilo, <br>Let us our homage show: <br>Our heart\'s joy reclineth <br>In praesepio; <br>And like a bright star shineth <br>Matris in gremio, <br>Alpha es et O!</p><p class="verse"><strong>Verse 2</strong>O Jesu, parvule, <br>I yearn for thee alway! <br>Hear me, I beseech thee, <br>O puer optime; <br>My prayer, let it reach thee, <br>O princeps gloriae! <br>Trahe me post te!</p><p class="verse"><strong>Verse 3</strong>O patris caritas! <br>O nati lenitas! <br>Deeply were we stained <br>per nostra crimina; <br>But thou hast for us gained <br>coelorum gaudia. <br>— O that we were there! <br>— O that we were there!</p><p class="verse"><strong>Verse 4</strong>Ubi sunt gaudia, where, <br>if they be not there? <br>There are angels singing <br>nova cantica; <br>there the bells are ringing, <br>in Regis curia. <br>— O that we were there! <br>— O that we were there!</p>',
        'reading9-title': 'John 1:1–14',
        'reading9-subtitle': 'The Word Became Flesh',
        'reading9-text': '<p>In the beginning was the Word, and the Word was with God, and the Word was God.</p><p>He was in the beginning with God.</p><p>All things came to be through him, and without him nothing came to be. What came to be through him was life, and this life was the light of the human race; the light shines in the darkness, and the darkness has not overcome it.</p><p>A man named John was sent from God. He came for testimony, to testify to the light, so that all might believe through him. He was not the light, but came to testify to the light.</p><p>The true light, which enlightens everyone, was coming into the world.</p><p>He was in the world, and the world came to be through him, but the world did not know him.</p><p>He came to what was his own, but his own people did not accept him.</p><p>But to those who did accept him he gave power to become children of God, to those who believe in his name, who were born not by natural generation nor by human choice nor by a man\'s decision but of God.</p><p>And the Word became flesh and made his dwelling among us, and we saw his glory, the glory as of the Father\'s only Son, full of grace and truth.</p>',
        'carol9-title': 'O Come, All Ye Faithful',
        'carol9-subtitle': 'John Francis Wade, arr. David Willcocks',
        'carol9-text': '<p class="refrain"><strong>Venite adoramus. Venite adoramus. <br>Venite adoramus, Dominum!</strong></p><p class="verse"><strong>Verse 1</strong>O come, all ye faithful, <br>Joyful and triumphant, <br>O come ye, O come ye to Bethlehem; <br>Come and behold him, <br>Born the King of Angels.</p><p class="verse"><strong>Verse 2</strong>God of God, <br>Light of Light, <br>Lo! he abhors not the Virgin\'s womb; <br>Very God, <br>Begotten, not created.</p><p class="verse"><strong>Verse 3</strong>Sing, choirs of angels, <br>Sing in exultation, <br>Sing, all ye citizens of heaven above! <br>Glory to God <br>in the highest.</p><p class="verse"><strong>Verse 4</strong>Yea, Lord, we greet thee, <br>Born this happy morning, <br>Jesu, to thee be glory given; <br>Word of the Father, <br>Now in flesh appearing!</p>',
        'closing-title': 'Closing Prayer & Final Carol – The First Noel',
        'closing-subtitle': 'Traditional English carol',
        'closing-text': '<p class="refrain"><strong>Noël, Noël, Noël, Noël, <br>Born is the King of Israel.</strong></p><p class="verse"><strong>Verse 1</strong>The first Noël the angel did say <br>Was to certain poor shepherds in fields as they lay; <br>in fields where they lay keeping their sheep, <br>On a cold winter\'s night that was so deep.</p><p class="verse"><strong>Verse 2</strong>They looked up and saw a star <br>Shining in the east, beyond them far; <br>And to the earth it gave great light, <br>And so it continued both day and night.</p><p class="verse"><strong>Verse 3</strong>And by the light of that same star, <br>Three wise men came from country far; <br>To seek for a King was their intent, <br>And to follow the star wherever it went.</p><p class="verse"><strong>Verse 4</strong>This star drew nigh to the northwest, <br>O\'er Bethlehem it took its rest; <br>And there it did both stop and stay, <br>Right over the place where Jesus lay.</p><p class="verse"><strong>Verse 5</strong>Then entered in those wise men three, <br>Full reverently upon their knee, <br>And offered there in his presence <br>Their gold and myrrh and frankincense.</p>',
        'feedback-title': 'Feedback',
        'feedback-content': '<p>We welcome your feedback on this service.</p><p><a href="https://forms.gle/VoiqR5hhWGPdjgmJ7?embedded=true" target="_blank">Click here to provide feedback</a></p>',
        'feedback-text': 'We\'d love to hear your thoughts about this service.',
        'feedback-link': 'Provide Feedback',
        'feedback-url': 'https://forms.gle/VoiqR5hhWGPdjgmJ7',
        'info-title': 'About Vox Sacra',
        'info-mission': '<p>To made good use of the talents the Lord has given us into sacred music of love and generosity, and to offer glory to God—this is the mission of the <b>Vox Sacra Ensemble</b>.</p><p>We are a group of Catholic faithful residing in New York, united by a shared passion for music. Our repertoire spans the breadth of Catholic tradition, from its deep-rooted sacred music to contemporary works of our time.</p><p>Through various apostolic activities—such as retreats, charity concerts, and liturgical music—we strive to faithfully live out our calling to proclaim the Gospel through music. We warmly ask for your encouragement, support, and prayers as we continue to expand our apostolic and musical endeavors.</p><p><i>If you would like to become a member or supporter, please refer to the link below.</i></p>',
        'sponsorship-button': 'Support Vox Sacra',
        'sponsorship-url': 'https://forms.gle/31Xxs7rC2Cf6x9pd6',
        'language-modal-title': 'Select Language',
        'language-modal-text': 'Please select your preferred language:',
        'font-size-label': 'Font Size',
        'language-label': 'Language'
    },
    ko: {
        'toc-label': '목차',
        'toc-cover': '표지',
        'toc-prayer-intro': '시작 기도: 서론',
        'toc-prayer-our-father': '시작 기도: 주님의 기도',
        'toc-prayer-hail-mary': '시작 기도: 성모송',
        'toc-prayer-closing': '시작 기도: 마침',
        'toc-reading1': '제 1 독서',
        'toc-carol1': '오라 오라 임마누엘',
        'toc-reading2': '제 2 독서',
        'toc-carol2': '밤의 별들을 지으신 창조주',
        'toc-reading3': '제 3 독서',
        'toc-carol3': '로즈가 피었도다',
        'toc-reading4': '제 4 독서',
        'toc-carol4': '다윗 성에 한 번',
        'toc-reading5': '제 5 독서',
        'toc-carol5': '아베 마리아',
        'toc-reading6': '제 6 독서',
        'toc-carol6': '고요한 밤',
        'toc-reading7': '제 7 독서',
        'toc-carol7': '기쁘다 구주 오셨네',
        'toc-reading8': '제 8 독서',
        'toc-carol8': '인 둘치 주빌로',
        'toc-reading9': '제 9 독서',
        'toc-carol9': '오라 모든 신실한 자들',
        'toc-closing': '마침 기도 및 마지막 성가',
        'toc-feedback': '피드백',
        'cover-title': '말씀과 성가',
        'cover-subtitle': '전체 프로그램',
        'prayer-intro-title': '시작 기도: 서론',
        'prayer-our-father-title': '시작 기도: 주님의 기도',
        'prayer-hail-mary-title': '시작 기도: 성모송',
        'prayer-closing-title': '시작 기도: 마침',
        'reading1-title': '창세기 3:8-15',
        'reading1-subtitle': '타락과 구원의 첫 약속',
        'reading1-text': '<p>그들은 주 하느님께서 저녁 산들바람 속에 동산을 거니시는 소리를 들었다. 사람과 그 아내는 주 하느님 앞을 피하여 동산 나무 사이에 숨었다. 주 하느님께서 사람을 부르시며, "너 어디 있느냐?" 하고 물으셨다.</p><p>그가 대답하였다. "동산에서 당신의 소리를 듣고 제가 알몸이기 때문에 두려워 숨었습니다."</p><p>그분께서 "네가 알몸이라고 누가 일러 주더냐? 내가 너에게 따 먹지 말라고 명령한 그 나무 열매를 네가 따 먹었느냐?" 하고 물으시자, 사람이 대답하였다. "당신께서 저와 함께 살라고 주신 여자가 그 나무 열매를 저에게 주기에 제가 먹었습니다." 주 하느님께서 여자에게 "너는 어찌하여 이런 일을 저질렀느냐?" 하고 물으시자, 여자가 대답하였다. "뱀이 저를 꾀어서 제가 따 먹었습니다."</p><p>주 하느님께서 뱀에게 말씀하셨다. "네가 이런 일을 저질렀으니 너는 모든 집짐승과 들짐승 가운데에서 저주를 받아 네가 사는 동안 줄곧 배로 기어다니며 먼지를 먹으리라. 나는 너와 그 여자 사이에, 네 후손과 그 여자의 후손 사이에 적개심을 일으키리니 여자의 후손은 너의 머리에 상처를 입히고 너는 그의 발꿈치에 상처를 입히리라."</p>',
        'carol1-title': '오라 오라 임마누엘',
        'carol1-subtitle': '15세기 프랑스 선율, 편곡 데이비드 윌콕스',
        'carol1-text': '<p class="verse"><strong>1.</strong> 오소서, 오소서, 임마누엘이여,<br>사로잡힌 당신 백성 이스라엘을 구속하소서.<br>하느님의 사랑하는 아들의 얼굴에서 멀리 떨어져<br>슬픈 유배길에 오른 그들을 구원하소서.</p><p class="refrain"><strong>후렴:</strong><br>기뻐하라! 기뻐하라!<br>임마누엘께서 너희에게 오시리라, 오 이스라엘아.</p><p class="verse"><strong>2.</strong> 오소서, 이새의 가지여!<br>사자의 발톱에 사로잡힌 자를 이끌어내소서.<br>무덤의 두려운 굴에서,<br>지옥의 심연에서, 당신 백성을 구해 주소서.</p><p class="verse"><strong>3.</strong> 오소서, 오소서, 찬란한 새벽이여!<br>우리 영혼에 치유의 빛을 부어주소서.<br>오랜 밤의 짙은 어둠을 몰아내시고,<br>무덤의 그림자를 뚫고 빛을 비추소서.</p><p class="verse"><strong>4.</strong> 오소서, 다윗의 열쇠를 가지신 주여!<br>왕의 문을 활짝 여시고 자유롭게 하소서.<br>우리들의 하늘 가는 길을 지켜주시고,<br>죽음의 거처로 가는 길은 막아주소서.</p><p class="verse"><strong>5.</strong> 오소서, 오소서, 아도나이여,<br>영광스러운 위엄으로 빛나시는 분,<br>그 높은 두려움의 산에서<br>하느님의 백성에게 율법을 주셨던 분이여.</p>',
        'reading2-title': '창세기 22:15-18',
        'reading2-subtitle': '아브라함에게 하신 하느님의 약속',
        'reading2-text': '<p>주님의 천사가 하늘에서 두 번째로 아브라함을 불러 말하였다. "나는 나 자신을 걸고 맹세한다. 주님의 말씀이다. 네가 이 일을 하였으니, 곧 너의 아들, 너의 외아들까지 아끼지 않았으니, 나는 너에게 한껏 복을 내리고, 네 후손이 하늘의 별처럼, 바닷가의 모래처럼 한껏 번성하게 해 주겠다. 너의 후손은 원수들의 성문을 차지할 것이다. 네가 나에게 순종하였으니, 세상의 모든 민족들이 너의 후손을 통하여 복을 받을 것이다."</p>',
        'carol2-title': '밤의 별들을 지으신 창조주',
        'carol2-subtitle': '라틴 찬송 (9세기)',
        'carol2-text': '<p>이 고대 저녁 찬송은 두 번째 독서에 대한 응답으로 불립니다.</p>',
        'reading3-title': '이사야 9:1-6',
        'reading3-subtitle': '어둠 속을 걷던 백성이 큰 빛을 보았도다',
        'reading3-text': '<p>어둠 속을 걷던 백성이 큰 빛을 봅니다. 암흑의 땅에 사는 이들에게 빛이 비칩니다.</p><p>당신께서는 즐거움을 많게 하시고 기쁨을 크게 하십니다. 사람들이 당신 앞에서 기뻐합니다, 수확할 때 기뻐하듯 전리품을 나눌 때 즐거워하듯. 정녕 당신께서는 그들이 짊어진 멍에와 어깨에 멘 장대와 부역 감독관의 몽둥이를 미디안을 치신 그날처럼 부수십니다. 땅을 흔들며 저벅거리는 군화도 피 속에 뒤군 군복도 모조리 화염에 싸여 불꽃의 먹이가 됩니다. 우리에게 한 아기가 태어났고 우리에게 한 아들이 주어졌습니다. 왕권이 그의 어깨에 놓이고 그의 이름은 놀라운 경륜가, 용맹한 하느님, 영원한 아버지 평화의 군왕이라 불리리이다. 다윗의 왕좌와 그의 왕국 위에 놓인 그 왕권은 강대하고 그 평화는 끝이 없으리이다. 그는 이제부터 영원까지 공정과 정의로 그 왕국을 굳게 세우고 지켜 가리이다. 만군의 주님의 열정이 이를 이루시리이다.</p>',
        'carol3-title': '로즈가 피었도다',
        'carol3-subtitle': '14세기 독일 선율',
        'carol3-text': '<p class="verse"><strong>1절</strong><br>오, 한 송이 장미 피어나네<br>부드러운 줄기에서 솟아올라!<br>이새의 후손으로 오신 분,<br>옛 예언이 노래한 그분이라.<br>그 밝게 빛나는 작은 꽃이<br>찬 겨울 속에 피었네,<br>밤이 반쯤 저물어 가던 그때에.</p><p class="verse"><strong>2절</strong><br>이사야가 예언한 그 장미,<br>그분을 우리가 기억하네.<br>자비로운 동정녀 마리아와 함께<br>그 꽃을 바라보네.<br>하느님의 사랑을 드러내려<br>그녀는 구세주를 낳으셨네,<br>밤이 저물어 가던 그때에.</p>',
        'reading4-title': '이사야 11:1-9',
        'reading4-subtitle': '평화로운 왕국',
        'reading4-text': '<p>이사이의 그루터기에서 햇순이 돋아나고 그 뿌리에서 새싹이 움트리라.</p><p>그 위에 주님의 영이 머무르리니 지혜와 슬기의 영 경륜과 용맹의 영 지식의 영과 주님을 경외함이다. 그는 주님을 경외함으로 흐뭇해하리라. 그는 자기 눈에 보이는 대로 판결하지 않고 자기 귀에 들리는 대로 심판하지 않으리라. 힘없는 이들을 정의로 재판하고 이 땅의 가련한 이들을 정당하게 심판하리라. 그는 자기 입에서 나오는 막대로 무뢰배를 내리치고 자기 입술에서 나오는 바람으로 악인을 죽이리라.</p><p>정의가 그의 허리를 두르는 띠가 되고 신의가 그의 몸을 두르는 띠가 되리라. 늑대가 새끼 양과 함께 살고 표범이 새끼 염소와 함께 지내리라. 송아지가 새끼 사자와 더불어 살쪄 가고 어린아이가 그들을 몰고 다니리라. 암소와 곰이 나란히 풀을 뜯고 그 새끼들이 함께 지내리라. 사자가 소처럼 여물을 먹고 젖먹이가 독사 굴 위에서 장난하며 젖 떨어진 아이가 살무사 굴에 손을 디밀리라. 나의 거룩한 산 어디에서도 사람들은 악하게도 패덕하게도 행동하지 않으리니 바다를 덮는 물처럼 땅이 주님을 앎으로 가득할 것이기 때문이다.</p>',
        'carol4-title': '다윗 성에 한 번',
        'carol4-subtitle': 'H.J. 건틀렛, 편곡 데이비드 윌콕스',
        'carol4-text': '<p class="verse"><strong>1.</strong> 옛날 다윗의 거룩한 도성에<br>겸손한 외양간이 있었네,<br>어머니가 아기를 눕히셨도다,<br>구유를 그의 침상으로 삼아.<br>온유한 그 어머니는 마리아,<br>예수 그리스도는 그분의 아기시라.</p><p class="verse"><strong>2.</strong> 하늘에서 이 땅으로 내려오신 분,<br>만물의 주님이요 하느님이신 분.<br>그분의 거처는 마굿간,<br>그분의 요람은 외양간.<br>가난하고 천하고 낮은 자들과 함께,<br>우리의 거룩한 구세주께서 사셨도다.</p><p class="verse"><strong>3.</strong> 그분의 놀라운 어린 시절 내내,<br>그분는 공경하며 순종하셨네.<br>사랑으로 바라보라 겸손한 분을,<br>그 온유한 품 안에 누워 계시네.<br>모든 그리스도인의 아이들도 마땅히<br>예수님처럼 온유하고, 순종하며, 착해야 하리.</p><p class="verse"><strong>4.</strong> 그분은 우리 어린 시절의 모범이시라,<br>날마다 우리처럼 자라나셨네.<br>작고, 약하고, 도울 힘 없어도,<br>눈물과 미소도 우리와 같이 아셨네.<br>그는 우리의 슬픔을 느끼시며,<br>우리의 기쁨을 함께 나누시네.</p><p class="verse"><strong>6.</strong> 이제는 그 가난하고 낮은 마굿간이 아니라,<br>소들이 서 있는 그곳이 아니라,<br>하늘에서 그 분을 뵈오리,<br>하느님의 오른편에 앉아 계신 주님을.<br>그 때 별처럼 빛나는 그의 자녀들,<br>모두 흰 옷 입고 주님 곁에 서 있으리</p>',
        'reading5-title': '누가복음 1:26-38',
        'reading5-subtitle': '성모 영보',
        'reading5-text': '<p>여섯째 달에 하느님께서는 가브리엘 천사를 갈릴래아 지방 나자렛이라는 고을로 보내시어, 다윗 집안의 요셉이라는 사람과 약혼한 처녀를 찾아가게 하셨다. 그 처녀의 이름은 마리아였다. 천사가 마리아의 집으로 들어가 말하였다. "은총이 가득한 이여, 기뻐하여라. 주님께서 너와 함께 계시다." 이 말에 마리아는 몹시 놀랐다. 그리고 이 인사말이 무슨 뜻인가 하고 곰곰이 생각하였다. 천사가 다시 마리아에게 말하였다. "두려워하지 마라, 마리아야. 너는 하느님의 총애를 받았다. 보라, 이제 네가 잉태하여 아들을 낳을 터이니 그 이름을 예수라 하여라. 그분께서는 큰 인물이 되시고 지극히 높으신 분의 아드님이라 불리실 것이다. 주 하느님께서 그분의 조상 다윗의 왕좌를 그분께 주시어, 그분께서 야곱 집안을 영원히 다스리시리니 그분의 나라는 끝이 없을 것이다."</p><p>마리아가 천사에게, "저는 남자를 알지 못하는데, 어떻게 그런 일이 있을 수 있겠습니까?" 하고 말하자, 천사가 마리아에게 대답하였다. "성령께서 너에게 내려오시고 지극히 높으신 분의 힘이 너를 덮을 것이다. 그러므로 태어날 아기는 거룩하신 분, 하느님의 아드님이라고 불릴 것이다.</p><p>네 친척 엘리사벳을 보아라. 그 늙은 나이에도 아들을 잉태하였다. 아이를 못낳는 여자라고 불리던 그가 임신한 지 여섯 달이 되었다. 하느님께는 불가능한 일이 없다."</p><p>마리아가 말하였다. "보십시오, 저는 주님의 종입니다. 말씀하신 대로 저에게 이루어지기를 바랍니다." 그러자 천사는 마리아에게서 떠나갔다.</p>',
        'carol5-title': '아베 마리아',
        'carol5-subtitle': '자크 아르카델트, 16세기',
        'carol5-text': '<p>은총이 가득하신 마리아님,<br>기뻐하소서.<br>주님께서 함께 계시니 여인 중에 복되시며,<br>태중의 아들 예수님 또한 복되시나이다.<br>천주의 성모 마리아님,<br>이제와 저희 죽을 때에<br>저희 죄인을 위하여 빌어주소서.<br>아멘.</p>',
        'reading6-title': '마태복음 1:18-25',
        'reading6-subtitle': '예수 그리스도의 탄생',
        'reading6-text': '<p>예수 그리스도께서는 이렇게 탄생하셨다. 그분의 어머니 마리아가 요셉과 약혼하였는데, 그들이 같이 살기 전에 마리아가 성령으로 말미암아 잉태한 사실이 드러났다. 마리아의 남편 요셉은 의로운 사람이었고 또 마리아의 일을 세상에 드러내고 싶지 않았으므로, 남모르게 마리아와 파혼하기로 작정하였다. 요셉이 그렇게 하기로 생각을 굳혔을 때, 꿈에 주님의 천사가 나타나 말하였다. "다윗의 자손 요셉아, 두려워하지 말고 마리아를 아내로 맞아들여라. 그 몸에 잉태된 아기는 성령으로 말미암은 것이다. 마리아가 아들을 낳으리니 그 이름을 예수라고 하여라. 그분께서 당신 백성을 죄에서 구원하실 것이다."</p><p>주님께서 예언자를 통하여 하신 말씀이 이루어지려고 이 모든 일이 일어났다. 곧 "보아라, 동정녀가 잉태하여 아들을 낳으리니 그 이름을 임마누엘이라고 하리라." 하신 말씀이다. 임마누엘은 번역하면 \'하느님께서 우리와 함께 계시다.\'는 뜻이다.</p><p>잠에서 깨어난 요셉은 주님의 천사가 명령한 대로 아내를 맞아들였다. 그러나 아내가 아들을 낳을 때까지 잠자리를 같이하지 않았다. 그리고 아들의 이름을 예수라고 하였다.</p>',
        'carol6-title': '고요한 밤',
        'carol6-subtitle': '프란츠 그루버, 편곡 존 러터',
        'carol6-text': '<p class="verse"><strong>1.</strong> 고요한 밤, 거룩한 밤,<br>모든 것이 평화롭고, 빛으로 가득하네.<br>동정 어머니의 품에 안긴,<br>부드럽고 온유하신 거룩한 아기 예수,<br>하늘의 평화 속에 주무시네,<br>하늘의 평화 속에 주무시네.</p><p class="verse"><strong>2.</strong> 고요한 밤, 거룩한 밤,<br>목자들이 놀라 떨며 바라보네,<br>멀리 하늘에서 영광의 빛이 흘러오고,<br>천사들이 노래하네, "알렐루야,<br>구세주 예수 나셨도다,<br>구세주 예수 나셨도다."</p><p class="verse"><strong>3.</strong> 고요한 밤, 거룩한 밤,<br>하느님 아들, 순수한 사랑의 빛,<br>그 거룩한 얼굴에서 찬란한 광채가 비추고,<br>구원의 은총이 세상에 내리시네,<br>예수님, 주님. 탄생하셨네,<br>예수님, 주님, 탄생하셨네.</p>',
        'reading7-title': '누가복음 2:8-20',
        'reading7-subtitle': '목자들에게 전해진 예수의 탄생 소식',
        'reading7-text': '<p>그 고장에는 들에 살면서 밤에도 양 떼를 지키는 목자들이 있었다. 그런데 주님의 천사가 다가오고 주님의 영광이 그 목자들의 둘레를 비추었다. 그들은 몹시 두려워하였다. 그러자 천사가 그들에게 말하였다. "두려워하지 마라. 보라, 나는 온 백성에게 큰 기쁨이 될 소식을 너희에게 전한다. 오늘 너희를 위하여 다윗 고을에서 구원자가 태어나셨으니, 주 그리스도이시다. 너희는 포대기에 싸여 구유에 누워 있는 아기를 보게 될 터인데, 그것이 너희를 위한 표징이다."</p><p>그때에 갑자기 그 천사 곁에 수많은 하늘의 군대가 나타나 하느님을 이렇게 찬미하였다. "지극히 높은 곳에서는 하느님께 영광<br>땅에서는 그분 마음에 드는 사람들에게 평화!"</p><p>천사들이 하늘로 떠나가자 목자들은 서로 말하였다. "베들레헴으로 가서 주님께서 우리에게 알려 주신 그 일, 그곳에서 일어난 일을 봅시다." 그리고 서둘러 가서, 마리아와 요셉과 구유에 누운 아기를 찾아냈다. 목자들은 아기를 보고 나서, 그 아기에 관하여 들은 말을 알려 주었다. 그것을 들은 이들은 모두 목자들이 자기들에게 전한 말에 놀라워하였다. 그러나 마리아는 이 모든 일을 마음속에 간직하고 곰곰이 되새겼다.</p><p>목자들은 천사가 자기들에게 말한 대로 듣고 본 모든 것에 대하여 하느님을 찬양하고 찬미하며 돌아갔다.</p>',
        'carol7-title': '기쁘다 구주 오셨네',
        'carol7-subtitle': '펠릭스 멘델스존, 편곡 데이비드 윌콕스',
        'carol7-text': '<p class="verse"><strong>1.</strong> 들으라, 천사들 노래소리,<br>"새로 나신 왕께 영광을 돌리세!<br>온 땅에 평화, 자비가 넘치니,<br>하느님과 죄인들이 화해하였네.<br>모든 나라여, 기뻐 일어나라,<br>하늘의 승리에 함께하라.<br>천사의 무리와 함께 선포하라,<br>"그리스도께서 베들레헴에 나셨도다!"<br>들으라, 천사들이 노래하네,<br>새로 나신 왕께 영광을 돌리세!</p><p class="verse"><strong>2.</strong> 하늘의 주님께 경배드리세,<br>영원하신 그리스도,<br>때가 차서 동정녀의 품에서 나신 이,<br>하느님께서 사람이 되셨네.<br>육신 속에 감추인 신성,<br>사람이 되신 하느님을 찬미하여라.<br>우리와 함께 하시기를 기뻐하시는<br>우리의 임마누엘 예수님,<br>들으라, 천사들 노래하네,<br>새로나신 왕께 영광을 돌리세!</p><p class="verse"><strong>3.</strong> 경배하라, 하늘에서 나신 평화의 임금!<br>경배하라, 의로움의 아들이여!<br>그분은 세상에 빛과 생명을 주시고,<br>날개 아래 치유의 은총을 베푸시네.<br>온유히 자신의 영광을 내려놓으시고,<br>인류를 죽음에서 구하시려 오셨도다.<br>땅의 자녀들을 일으키시고,<br>새 생명을 주시려 태어나셨네.<br>들으라, 천사들 노래하네,<br>새로나신 왕께 영광을 돌리세!</p>',
        'reading8-title': '마태복음 2:1-12',
        'reading8-subtitle': '동방 박사들의 방문',
        'reading8-text': '<p>예수님께서는 헤로데 임금 때에 유다 베들레헴에서 태어나셨다. 그러자 동방에서 박사들이 예루살렘에 와서, "유다인들의 임금으로 태어나신 분이 어디 계십니까? 우리는 동방에서 그분의 별을 보고 그분께 경배하러 왔습니다." 하고 말하였다. 이 말을 듣고 헤로데 임금을 비롯하여 온 예루살렘이 깜짝 놀랐다. 헤로데는 백성의 수석 사제들과 율법 학자들을 모두 모아 놓고, 메시아가 태어날 곳이 어디인지 물어보았다. 그들이 헤로데에게 말하였다. "유다 베들레헴입니다. 사실 예언자가 이렇게 기록해 놓았습니다. \'유다 땅 베들레헴아 너는 유다의 주요 고을 가운데 결코 가장 작은 고을이 아니다. 너에게서 통치자가 나와 내 백성 이스라엘을 보살피리라.\'"</p><p>그때에 헤로데는 박사들을 몰래 불러 별이 나타난 시간을 정확히 알아내고서는, 그들을 베들레헴으로 보내면서 말하였다. "가서 그 아기에 관하여 잘 알아보시오. 그리고 그 아기를 찾거든 나에게 알려 주시오. 나도 가서 경배하겠소." 그들은 임금의 말을 듣고 길을 떠났다. 그러자 동방에서 본 별이 그들을 앞서가다가, 아기가 있는 곳 위에 이르러 멈추었다. 그들은 그 별을 보고 더없이 기뻐하였다. 그리고 그 집에 들어가 어머니 마리아와 함께 있는 아기를 보고 땅에 엎드려 경배하였다. 또 보물 상자를 열고 아기에게 황금과 유향과 몰약을 예물로 드렸다. 그들은 꿈에 헤로데에게 돌아가지 말라는 지시를 받고, 다른 길로 자기 고장에 돌아갔다.</p>',
        'carol8-title': '인 둘치 주빌로',
        'carol8-subtitle': '고대 독일 성가, 편곡 R. L. 피어솔',
        'carol8-text': '<p class="verse"><strong>1.</strong> 달콤한 기쁨 가운데!<br>우리의 경배를 드리세:<br>우리 마음의 기쁨이<br>구유 속에 누워 계시네.<br>그리고 밝은 별처럼 빛나시니,<br>주님은 알파요 오메가이시다!</p><p class="verse"><strong>2.</strong> 오 예수님, 아기시여,<br>언제나 당신을 그리나이다!<br>간절히 청하오니 들어주소서,<br>오 가장 거룩한 아기여!<br>나의 기도가 당신께 닿게 하소서,<br>오 영광의 임금이시여!<br>당신을 따르도록 저를 이끌어 주소서</p><p class="verse"><strong>3.</strong> 오 성부의 자비시여!<br>오 성자의 온유하심이여!<br>우리는 우리의 죄로 깊이 물들었나이다,<br>주님, 당신께서 우리를 위하여<br>하늘의 기쁨을 되찾아 주셨나이다.<br>— 아, 우리가 그곳에 있다면!<br>— 아, 그 천상에 있을 수 있다면!</p><p class="verse"><strong>4.</strong> 참된 기쁨이 어디 있으랴,<br>그곳이 아니라면 어디 있으랴?<br>그곳에서는 천사들이<br>새로운 노래를 부르고,<br>임금님의 궁에서는<br>종소리가 울리도다.<br>— 아, 우리가 그곳에 있다면!<br>— 아, 그 천상에 있을 수 있다면!</p>',
        'reading9-title': '요한복음 1:1-14',
        'reading9-subtitle': '말씀이 육신이 되셨도다',
        'reading9-text': '<p>한처음에 말씀이 계셨다.<br>말씀은 하느님과 함께 계셨는데 말씀은 하느님이셨다. 그분께서는 한처음에 하느님과 함께 계셨다. 모든 것이 그분을 통하여 생겨났고 그분 없이 생겨난 것은 하나도 없다. 그분 안에 생명이 있었으니 그 생명은 사람들의 빛이었다. 그 빛이 어둠 속에서 비치고 있지만 어둠은 그를 깨닫지 못하였다. 하느님께서 보내신 사람이 있었는데 그의 이름은 요한이었다.</p><p>그는 증언하러 왔다. 빛을 증언하여 자기를 통해 모든 사람이 믿게 하려는 것이었다. 그 사람은 빛이 아니었다.<br>빛을 증언하러 왔을 따름이다. 모든 사람을 비추는 참빛이 세상에 왔다. 그분께서 세상에 계셨고<br>세상이 그분을 통하여 생겨났지만 세상은 그분을 알아보지 못하였다. 그분께서 당신 땅에 오셨지만<br>그분의 백성은 그분을 맞아들이지 않았다. 그분께서는 당신을 받아들이는 이들, 당신의 이름을 믿는 모든 이에게 하느님의 자녀가 되는 권한을 주셨다. 이들은 혈통이나 육욕이나 남자의 욕망에서 난 것이 아니라<br>하느님에게서 난 사람들이다.</p><p>말씀이 사람이 되시어 우리 가운데 사셨다. 우리는 그분의 영광을 보았다. 은총과 진리가 충만하신<br>아버지의 외아드님으로서 지니신 영광을 보았다.</p>',
        'carol9-title': '오라 모든 신실한 자들',
        'carol9-subtitle': '존 프랜시스 웨이드, 편곡 데이비드 윌콕스',
        'carol9-text': '<p class="verse"><strong>1.</strong> 오라, 믿음이 가득한 이들이여,<br>기쁘고 승리한 자들이여,<br>오라, 오라, 베들레헴으로 가보세.<br>오라, 그분을 경배하라,<br>천사들의 왕으로 나신 그분을.</p><p class="refrain"><strong>후렴:</strong><br>어서가 우리 경배하세,<br>어서가 우리 경배하세,<br>어서가 우리 경배하세 주님을.</p><p class="verse"><strong>2.</strong> 하느님께서 나신 하느님,<br>빛에서 나신 빛,<br>보라! 그는 동정녀의 품을 마다하지 않으셨도다.<br>참 하느님,<br>창조지 않고 나신 분이시라.</p><p class="verse"><strong>6.</strong> 찬양하라, 천사들의 노래로,<br>환희의 노래를 드려라!<br>노래하라, 하늘의 모든 백성들아!<br>지극히 높은 곳에서<br>하느님께 영광!</p><p class="verse"><strong>7.</strong> 그렇습니다, 주님, 저희가 주님을 맞이하나이다<br>오늘 이 기쁜 아침에,<br>예수님, 영광을 받으소서!<br>아버지의 말씀이신 주님,<br>이제 사람의 몸으로 오셨도다!</p>',
        'closing-title': '마침 기도 및 마지막 성가 – 첫 번째 노엘',
        'closing-subtitle': '전통적인 영국 성가',
        'closing-text': '<p class="verse"><strong>1절</strong><br>첫 번째 노엘 천사가 말했도다, 들에 누워 있던 가난한 목자들에게; 그들이 양을 지키며 누워 있던 들에서, 매우 추운 겨울 밤에.</p><p class="refrain"><strong>후렴:</strong> 노엘, 노엘, 노엘, 노엘, 이스라엘의 왕이 태어나셨도다.</p><p class="verse"><strong>2절</strong><br>그들이 올려다보니 동쪽에 별이 빛나고 있었도다, 그들로부터 멀리; 그리고 땅에 큰 빛을 주었도다, 그래서 그것이 낮과 밤 계속되었도다.</p><p class="verse"><strong>3절</strong><br>그리고 그 같은 별의 빛으로, 세 명의 현자가 먼 나라에서 왔도다; 왕을 찾는 것이 그들의 의도였고, 별이 어디로 가든 그것을 따랐도다.</p><p class="verse"><strong>4절</strong><br>이 별이 서북쪽으로 가까이 와서, 베들레헴 위에서 쉬었도다; 그리고 거기서 멈추고 머물렀도다, 바로 예수께서 누워 계신 곳 위에.</p><p class="verse"><strong>5절</strong><br>그때 그 세 명의 현자가 들어왔도다, 매우 경건하게 무릎을 꿇고, 그리고 거기서 그의 앞에 그들의 금과 몰약과 유향을 드렸도다.</p>',
        'feedback-title': '피드백',
        'feedback-content': '<p>이 예배에 대한 피드백을 환영합니다.</p><p><a href="https://forms.gle/PQ7d4zRT9yns6YaK7?embedded=true" target="_blank">피드백을 제공하려면 여기를 클릭하세요</a></p>',
        'feedback-text': '이 예배에 대한 여러분의 생각을 듣고 싶습니다.',
        'feedback-link': '피드백 제공',
        'feedback-url': 'https://forms.gle/fs7fqCdErMCWKjQY6',
        'info-title': '복스 사크라 소개',
        'info-mission': '<p>주님께서 주신 달란트를 사랑과 나눔의 성음악으로 승화시켜 하느님께 영광을 드리는 것—이것이 <b>Vox Sacra Ensemble</b> 의사명입니다.</p><p>뉴욕에 거주하는 천주교 신자들로 이루어진 저희는 음악에 대한 열정을 바탕으로, 가톨릭 전통의 뿌리 깊은 성음악에서 부터 우리 시대의 가톨릭 음악 까지 폭넓게 연주하고 있습니다.</p><p>또한 피정, 자선 음악회, 전례 음악 등 다양한 사도적 활동을 통해 음악 안에서 복음을 선포하는 소명을 꾸준히 실천하고자 합니다. 앞으로도 저희가 펼쳐 나갈 사도직과 음악 활동에 많은 격려와 응원, 그리고 기도로 함께해 주시기를 바랍니다.</p><p><i>* 단 원 이 되 고 싶 으 시 거 나 후 원 회 원 이 되 고 싶 은 분 은 아 래 의 링 크 를 참 조 해 주 세 요</i></p>',
        'sponsorship-button': '복스 사크라 후원하기',
        'sponsorship-url': 'https://forms.gle/fs7fqCdErMCWKjQY6',
        'language-modal-title': '언어 선택',
        'language-modal-text': '선호하는 언어를 선택해 주세요:',
        'font-size-label': '글자 크기',
        'language-label': '언어'
    }
};

function setLanguage(lang) {
    state.language = lang;
    document.documentElement.setAttribute('lang', lang);
    // Save preference to localStorage
    localStorage.setItem('voxSacraLanguage', lang);
    updateLanguage();
}

function updateLanguage() {
    const lang = state.language;
    const translation = translations[lang] || translations.en;
    
    // Update all elements with data-translate attribute
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translation[key]) {
            // Use innerHTML for elements that contain formatted content (readings, carols, info-mission)
            if (element.classList.contains('reading-text') || element.classList.contains('carol-text') || element.classList.contains('info-mission')) {
                element.innerHTML = translation[key];
            } else {
                element.textContent = translation[key];
            }
        }
        
        // Update href for elements with data-translate-url attribute (e.g., feedback link)
        const urlKey = element.getAttribute('data-translate-url');
        if (urlKey && translation[urlKey]) {
            element.href = translation[urlKey];
        }
    });
    
    // Update TOC label if it's showing a section title
    updateTOCLabel();
}

