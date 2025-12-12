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
        'carol1-text': '<p class="refrain"><strong>Rejoice! Rejoice! Emmanuel shall come to thee, O Israel.</strong></p><p class="verse"><strong>Verse 1</strong><br>O come, O come, Emmanuel, Redeem thy captive Israel,<br>That into exile drear is gone far from the face of God\'s dear Son.</p><p class="verse"><strong>Verse 2</strong><br>O come, thou Branch of Jesse! Draw the quarry from the lion\'s claw;<br>From the dread caverns of the grave, from nether hell, thy people save.</p><p class="verse"><strong>Verse 3</strong><br>O come, O come, thou Dayspring bright! Pour on our souls thy healing light;<br>Dispel the long night\'s ling\'ring gloom, and pierce the shadows of the tomb.</p><p class="verse"><strong>Verse 4</strong><br>O come, thou Lord of David\'s Key! The royal door fling wide and free;<br>Safeguard for us the heav\'nward road, and bar the way to death\'s abode.</p><p class="verse"><strong>Verse 5</strong><br>O come, O come, Adonai, who in thy glorious majesty<br>From that high mountain clothed with awe gavest thy folk the elder law.</p>',
        'reading2-title': 'Genesis 22:15–18',
        'reading2-subtitle': 'God\'s Promise to Abraham',
        'reading2-text': '<p>A second time the angel of the LORD called to Abraham from heaven and said:</p><p>"I swear by my very self—oracle of the LORD—that because you acted as you did in not withholding from me your son, your only one, I will bless you and make your descendants as countless as the stars of the sky and the sands of the seashore; your descendants will take possession of the gates of their enemies, and in your descendants all the nations of the earth will find blessing, because you obeyed my command."</p>',
        'carol2-title': 'Creator of the Stars of Night',
        'carol2-subtitle': 'Latin hymn (9th Century)',
        'carol2-text': '<p>This ancient evening hymn is sung as a response to the second reading.</p>',
        'reading3-title': 'Isaiah 9:1–6',
        'reading3-subtitle': 'The People Who Walked in Darkness Have Seen a Great Light',
        'reading3-text': '<p>The people who walked in darkness have seen a great light; upon those who lived in a land of gloom a light has shone.</p><p>You have brought them abundant joy and great rejoicing; they rejoice before you as people rejoice at harvest, as they exult when dividing the spoils.</p><p>For the yoke that burdened them, the pole on their shoulder, the rod of their taskmaster, you have smashed, as on the day of Midian.</p><p>For every boot that tramped in battle, every cloak rolled in blood, will be burned as fuel for fire.</p><p>For a child is born to us, a son is given to us; upon his shoulder dominion rests. They name him Wonder-Counselor, God-Hero, Father-Forever, Prince of Peace.</p><p>His dominion is vast and forever peaceful, upon David\'s throne, and over his kingdom, which he confirms and sustains by judgment and justice, both now and forever. The zeal of the LORD of hosts will do this!</p>',
        'carol3-title': 'Lo, How a Rose E\'er Blooming',
        'carol3-subtitle': '14th Century German melody',
        'carol3-text': '<p class="verse"><strong>Verse 1</strong><br>Lo, how a Rose e\'er blooming from tender stem hath sprung!<br>Of Jesse\'s lineage coming, as men of old have sung.<br>It came, a flow\'ret bright, amid the cold of winter, when half-spent was the night.</p><p class="verse"><strong>Verse 2</strong><br>Isaiah \'twas foretold it, the Rose I have in mind;<br>With Mary we behold it, the Virgin Mother kind.<br>To show God\'s love aright, she bore to men a Savior, when half-spent was the night.</p>',
        'reading4-title': 'Isaiah 11:1–9',
        'reading4-subtitle': 'The Peaceable Kingdom',
        'reading4-text': '<p>But a shoot shall sprout from the stump of Jesse, and from his roots a bud shall blossom.</p><p>The spirit of the LORD shall rest upon him: a spirit of wisdom and of understanding, a spirit of counsel and of strength, a spirit of knowledge and of fear of the LORD, and his delight shall be the fear of the LORD.</p><p>Not by appearance shall he judge, nor by hearsay shall he decide, but he shall judge the poor with justice, and decide fairly for the land\'s afflicted. He shall strike the ruthless with the rod of his mouth, and with the breath of his lips he shall slay the wicked.</p><p>Justice shall be the band around his waist, and faithfulness a belt upon his hips.</p><p>Then the wolf shall be a guest of the lamb, and the leopard shall lie down with the young goat; the calf and the young lion shall browse together, with a little child to guide them.</p><p>The cow and the bear shall graze, together their young shall lie down; the lion shall eat hay like the ox.</p><p>The baby shall play by the viper\'s den, and the child lay his hand on the adder\'s lair.</p><p>They shall not harm or destroy on all my holy mountain; for the earth shall be filled with knowledge of the LORD, as water covers the sea.</p>',
        'carol4-title': 'Once in Royal David\'s City',
        'carol4-subtitle': 'H.J. Gauntlett, arr. David Willcocks',
        'carol4-text': '<p class="verse"><strong>Verse 1</strong><br>Once in royal David\'s city stood a lowly cattle shed, where a mother laid her baby in a manger for his bed:<br>Mary was that mother mild, Jesus Christ, her little child.</p><p class="verse"><strong>Verse 2</strong><br>He came down to earth from heaven, who is God and Lord of all, and his shelter was a stable, and his cradle was a stall; with the poor, and mean, and lowly, lived on earth our Savior holy.</p><p class="verse"><strong>Verse 3</strong><br>And through all his wondrous childhood he would honor and obey, love, and watch the lowly maiden, in whose gentle arms he lay:<br>Christian children all must be mild, obedient, good as he.</p><p class="verse"><strong>Verse 4</strong><br>For he is our childhood\'s pattern, day by day like us he grew, he was little, weak, and helpless, tears and smiles like us he knew; and he feeleth for our sadness, and he shareth in our gladness.</p><p class="verse"><strong>Verse 6</strong><br>Not in that poor lowly stable, with the oxen standing by, we shall see him; but in heaven, set at God\'s right hand on high; when like stars his children crowned all in white shall wait around.</p>',
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
        'carol6-text': '<p class="verse"><strong>Verse 1</strong><br>Silent night, holy night, all is calm, all is bright, round yon Virgin, Mother and Child, holy Infant so tender and mild, sleep in heavenly peace, sleep in heavenly peace.</p><p class="verse"><strong>Verse 2</strong><br>Silent night, holy night, shepherds quake at the sight; glories stream from heaven afar, heav\'nly hosts sing: "Alleluia! Christ the Savior is born! Christ the Savior is born!"</p><p class="verse"><strong>Verse 3</strong><br>Silent night, holy night, Son of God, love\'s pure light, radiant beams from thy holy face, with the dawn of redeeming grace, Jesus, Lord, at thy birth, Jesus, Lord, at thy birth.</p>',
        'reading7-title': 'Luke 2:8–20',
        'reading7-subtitle': 'The Birth of Jesus Announced to Shepherds',
        'reading7-text': '<p>Now there were shepherds in that region living in the fields and keeping the night watch over their flock.</p><p>The angel of the Lord appeared to them and the glory of the Lord shone around them, and they were struck with great fear.</p><p>The angel said to them, "Do not be afraid; for behold, I proclaim to you good news of great joy that will be for all the people.</p><p>For today in the city of David a savior has been born for you who is Messiah and Lord.</p><p>And this will be a sign for you: you will find an infant wrapped in swaddling clothes and lying in a manger."</p><p>And suddenly there was a multitude of the heavenly host with the angel, praising God and saying: "Glory to God in the highest and on earth peace to those on whom his favor rests."</p><p>When the angels went away from them to heaven, the shepherds said to one another, "Let us go, then, to Bethlehem to see this thing that has taken place, which the Lord has made known to us."</p><p>So they went in haste and found Mary and Joseph, and the infant lying in the manger.</p><p>When they saw this, they made known the message that had been told them about this child.</p><p>All who heard it were amazed by what had been told them by the shepherds.</p><p>And Mary kept all these things, reflecting on them in her heart.</p><p>Then the shepherds returned, glorifying and praising God for all they had heard and seen, just as it had been told to them.</p>',
        'carol7-title': 'Hark! The Herald Angels Sing',
        'carol7-subtitle': 'Felix Mendelssohn, arr. David Willcocks',
        'carol7-text': '<p class="verse"><strong>Verse 1</strong><br>Hark! the herald angels sing, "Glory to the newborn King; peace on earth, and mercy mild, God and sinners reconciled." Joyful, all ye nations, rise, join the triumph of the skies; with the angelic host proclaim, "Christ is born in Bethlehem!" Hark! the herald angels sing, "Glory to the newborn King!"</p><p class="verse"><strong>Verse 2</strong><br>Christ, by highest heav\'n adored, Christ, the everlasting Lord, late in time behold him come, offspring of a Virgin\'s womb. Veiled in flesh, the Godhead see; hail th\'incarnate Deity, pleased, as man, with men to dwell, Jesus, our Emmanuel. Hark! the herald angels sing, "Glory to the newborn King!"</p><p class="verse"><strong>Verse 3</strong><br>Hail! the heav\'n-born Prince of Peace! Hail! the Son of Righteousness! Light and life to all he brings, ris\'n with healing in his wings. Mild he lays his glory by, born that man no more may die, born to raise the sons of earth, born to give them second birth. Hark! the herald angels sing, "Glory to the newborn King!"</p>',
        'reading8-title': 'Matthew 2:1–12',
        'reading8-subtitle': 'The Visit of the Magi',
        'reading8-text': '<p>When Jesus was born in Bethlehem of Judea, in the days of King Herod, behold, magi from the east arrived in Jerusalem, saying, "Where is the newborn king of the Jews? We saw his star at its rising and have come to do him homage."</p><p>When King Herod heard this, he was greatly troubled, and all Jerusalem with him.</p><p>Assembling all the chief priests and the scribes of the people, he inquired of them where the Messiah was to be born.</p><p>They said to him, "In Bethlehem of Judea, for thus it has been written through the prophet: \'And you, Bethlehem, land of Judah, are by no means least among the rulers of Judah; since from you shall come a ruler, who is to shepherd my people Israel.\'"</p><p>Then Herod called the magi secretly and ascertained from them the time of the star\'s appearance.</p><p>He sent them to Bethlehem and said, "Go and search diligently for the child. When you have found him, bring me word, that I too may go and do him homage."</p><p>After their audience with the king they set out. And behold, the star that they had seen at its rising preceded them, until it came and stopped over the place where the child was.</p><p>They were overjoyed at seeing the star, and on entering the house they saw the child with Mary his mother. They prostrated themselves and did him homage.</p><p>Then they opened their treasures and offered him gifts of gold, frankincense, and myrrh.</p><p>And having been warned in a dream not to return to Herod, they departed for their country by another way.</p>',
        'carol8-title': 'In Dulci Jubilo',
        'carol8-subtitle': 'Old German carol, arr. R. L. Pearsall',
        'carol8-text': '<p class="verse"><strong>Verse 1</strong><br>In dulci jubilo, let us our homage show: our heart\'s joy reclineth in praesepio; and like a bright star shineth matris in gremio, Alpha es et O!</p><p class="verse"><strong>Verse 2</strong><br>O Jesu, parvule, I yearn for thee alway! Hear me, I beseech thee, O puer optime; my prayer, let it reach thee, O princeps gloriae! Trahe me post te!</p><p class="verse"><strong>Verse 3</strong><br>O patris caritas! O nati lenitas! Deeply were we stained per nostra crimina; but thou hast for us gained coelorum gaudia. — O that we were there! — O that we were there!</p><p class="verse"><strong>Verse 4</strong><br>Ubi sunt gaudia, where, if they be not there? There are angels singing nova cantica; there the bells are ringing, in Regis curia. — O that we were there! — O that we were there!</p>',
        'reading9-title': 'John 1:1–14',
        'reading9-subtitle': 'The Word Became Flesh',
        'reading9-text': '<p>In the beginning was the Word, and the Word was with God, and the Word was God.</p><p>He was in the beginning with God.</p><p>All things came to be through him, and without him nothing came to be. What came to be through him was life, and this life was the light of the human race; the light shines in the darkness, and the darkness has not overcome it.</p><p>A man named John was sent from God. He came for testimony, to testify to the light, so that all might believe through him. He was not the light, but came to testify to the light.</p><p>The true light, which enlightens everyone, was coming into the world.</p><p>He was in the world, and the world came to be through him, but the world did not know him.</p><p>He came to what was his own, but his own people did not accept him.</p><p>But to those who did accept him he gave power to become children of God, to those who believe in his name, who were born not by natural generation nor by human choice nor by a man\'s decision but of God.</p><p>And the Word became flesh and made his dwelling among us, and we saw his glory, the glory as of the Father\'s only Son, full of grace and truth.</p>',
        'carol9-title': 'O Come, All Ye Faithful',
        'carol9-subtitle': 'John Francis Wade, arr. David Willcocks',
        'carol9-text': '<p class="verse"><strong>Verse 1</strong><br>O come, all ye faithful, joyful and triumphant, O come ye, O come ye to Bethlehem; come and behold him, born the King of Angels.</p><p class="refrain"><strong>Refrain:</strong> O come, let us adore him, O come, let us adore him, O come, let us adore him, Christ the Lord.</p><p class="verse"><strong>Verse 2</strong><br>God of God, Light of Light, lo! he abhors not the Virgin\'s womb; very God, begotten, not created.</p><p class="verse"><strong>Verse 6</strong><br>Sing, choirs of angels, sing in exultation, sing, all ye citizens of heaven above! Glory to God in the highest.</p><p class="verse"><strong>Verse 7</strong><br>Yea, Lord, we greet thee, born this happy morning, Jesu, to thee be glory given; Word of the Father, now in flesh appearing!</p>',
        'closing-title': 'Closing Prayer & Final Carol – The First Noel',
        'closing-subtitle': 'Traditional English carol',
        'closing-text': '<p class="verse"><strong>Verse 1</strong><br>The first Noël the angel did say was to certain poor shepherds in fields as they lay; in fields where they lay keeping their sheep, on a cold winter\'s night that was so deep.</p><p class="refrain"><strong>Refrain:</strong> Noël, Noël, Noël, Noël, born is the King of Israel.</p><p class="verse"><strong>Verse 2</strong><br>They looked up and saw a star shining in the east, beyond them far; and to the earth it gave great light, and so it continued both day and night.</p><p class="verse"><strong>Verse 3</strong><br>And by the light of that same star, three wise men came from country far; to seek for a King was their intent, and to follow the star wherever it went.</p><p class="verse"><strong>Verse 4</strong><br>This star drew nigh to the northwest, o\'er Bethlehem it took its rest; and there it did both stop and stay, right over the place where Jesus lay.</p><p class="verse"><strong>Verse 5</strong><br>Then entered in those wise men three, full reverently upon their knee, and offered there in his presence their gold and myrrh and frankincense.</p>',
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
        'reading1-text': '<p>그들이 날이 서늘할 때 동산에 거니시는 주 하느님의 소리를 들었습니다. 아담과 그의 아내는 주 하느님을 피하여 동산 나무들 사이에 숨었습니다.</p><p>주 하느님께서 아담을 부르시며 말씀하셨습니다. "너 어디 있느냐?"</p><p>아담이 대답했습니다. "동산에서 당신의 소리를 들었습니다. 그러나 벌거벗었으므로 두려워 숨었습니다."</p><p>하느님께서 물으셨습니다. "네가 벌거벗었다는 것을 누가 일러주었느냐? 내가 먹지 말라고 한 나무의 열매를 네가 먹었느냐?"</p><p>아담이 대답했습니다. "당신이 저와 함께 두신 여자가 그 나무의 열매를 주기에 제가 먹었습니다."</p><p>주 하느님께서 여자에게 물으셨습니다. "네가 한 일이 무엇이냐?" 여자가 대답했습니다. "뱀이 저를 속여서 제가 먹었습니다."</p><p>주 하느님께서 뱀에게 말씀하셨습니다:</p><p>"네가 이렇게 하였으므로 모든 집짐승과 들짐승보다 저주를 받아, 네가 평생 배로 기어 다니고 흙을 먹을 것이다.</p><p>내가 너와 여자 사이에, 그리고 네 후손과 여자의 후손 사이에 적의를 두리니, 여자의 후손은 네 머리를 상하게 하고 너는 그의 발꿈치를 상하게 할 것이다."</p>',
        'carol1-title': '오라 오라 임마누엘',
        'carol1-subtitle': '15세기 프랑스 선율, 편곡 데이비드 윌콕스',
        'carol1-text': '<p class="refrain"><strong>기뻐하라! 기뻐하라! 임마누엘이 오리라, 이스라엘이여.</strong></p><p class="verse"><strong>1절</strong><br>오라 오라 임마누엘, 포로된 이스라엘을 구하소서,<br>그들이 슬픈 유배지로 가서 하느님의 사랑하는 아들 얼굴에서 멀리 떠났나이다.</p><p class="verse"><strong>2절</strong><br>오라 이새의 가지여! 사자의 발톱에서 사냥감을 구하소서;<br>무서운 무덤의 동굴에서, 지옥에서 당신 백성을 구하소서.</p><p class="verse"><strong>3절</strong><br>오라 오라 밝은 새벽별이여! 우리 영혼에 당신의 치유의 빛을 부어주소서;<br>긴 밤의 남아있는 어둠을 쫓으시고 무덤의 그림자를 뚫으소서.</p><p class="verse"><strong>4절</strong><br>오라 다윗의 열쇠의 주인이여! 왕의 문을 넓게 열어주소서;<br>우리를 위해 하늘로 가는 길을 지키시고 죽음의 거처로 가는 길을 막으소서.</p><p class="verse"><strong>5절</strong><br>오라 오라 아도나이여, 당신의 영광스러운 위엄으로<br>경외로움으로 덮인 그 높은 산에서 당신 백성에게 옛 법을 주셨나이다.</p>',
        'reading2-title': '창세기 22:15-18',
        'reading2-subtitle': '아브라함에게 하신 하느님의 약속',
        'reading2-text': '<p>주님의 천사가 하늘에서 아브라함을 두 번째로 불러 말했습니다:</p><p>"주님의 말씀으로 맹세하노니, 네가 네 외아들을 내게 아끼지 않았으므로, 내가 너를 축복하고 네 자손을 하늘의 별처럼, 바닷가의 모래처럼 많게 하리라. 네 자손이 그들의 원수들의 성문을 차지할 것이며, 네가 내 명령을 따랐으므로 네 자손으로 말미암아 땅의 모든 민족이 복을 받을 것이다."</p>',
        'carol2-title': '밤의 별들을 지으신 창조주',
        'carol2-subtitle': '라틴 찬송 (9세기)',
        'carol2-text': '<p>이 고대 저녁 찬송은 두 번째 독서에 대한 응답으로 불립니다.</p>',
        'reading3-title': '이사야 9:1-6',
        'reading3-subtitle': '어둠 속을 걷던 백성이 큰 빛을 보았도다',
        'reading3-text': '<p>어둠 속을 걷던 백성이 큰 빛을 보았고, 죽음의 그늘진 땅에 사는 사람들에게 빛이 비쳤도다.</p><p>당신께서 그들에게 큰 기쁨을 주셨고, 그들이 당신 앞에서 기뻐하니, 추수 때 기뻐하는 것 같고, 전리품을 나눌 때 즐거워하는 것 같도다.</p><p>그들이 메었던 멍에와 어깨의 채찍, 압제자의 몽둥이를 당신께서 미디안의 날처럼 꺾으셨도다.</p><p>전쟁에서 짓밟힌 모든 군화와 피에 젖은 옷이 불에 타서 연료가 되리라.</p><p>우리에게 한 아기가 태어났고, 우리에게 한 아들이 주어졌도다. 그의 어깨에 통치권이 놓이리라. 그의 이름은 놀라운 상담자, 전능한 하느님, 영원한 아버지, 평화의 왕이라 불리리라.</p><p>그의 통치는 확대되어 끝없는 평화가 다윗의 왕좌와 그의 나라 위에 있을 것이며, 이를 공정과 정의로 굳게 세워 영원토록 지속시키리라. 만군의 주님의 열심이 이를 이루시리라!</p>',
        'carol3-title': '로즈가 피었도다',
        'carol3-subtitle': '14세기 독일 선율',
        'carol3-text': '<p class="verse"><strong>1절</strong><br>보라, 부드러운 줄기에서 로즈가 피었도다!<br>이새의 혈통에서 나왔으니, 옛 사람들이 노래한 대로.<br>그것이 왔도다, 밝은 꽃이, 추운 겨울 가운데, 밤이 반쯤 지났을 때.</p><p class="verse"><strong>2절</strong><br>이사야가 예언했도다, 내가 생각하는 그 로즈를;<br>마리아와 함께 우리가 그것을 보니, 자비로운 동정녀 어머니시도다.<br>하느님의 사랑을 바르게 보이시려, 그녀가 사람들에게 구주를 낳으셨도다, 밤이 반쯤 지났을 때.</p>',
        'reading4-title': '이사야 11:1-9',
        'reading4-subtitle': '평화로운 왕국',
        'reading4-text': '<p>이새의 그루터기에서 한 싹이 나오고, 그 뿌리에서 한 가지가 돋아나 꽃을 피우리라.</p><p>주님의 영이 그 위에 내리시리니, 지혜와 통찰의 영, 계획과 용기의 영, 지식과 주님을 경외하는 영이시리라. 그는 주님을 경외하는 것을 즐거워하리라.</p><p>그는 외모로 판단하지 않고, 소문으로 결정하지 않으며, 가난한 사람을 정의로 판단하고, 땅의 고통받는 사람들을 공정하게 판결하리라. 그는 입의 막대기로 포악한 자를 치고, 입술의 호흡으로 악인을 죽이리라.</p><p>정의가 그의 허리띠가 되고, 신실함이 그의 허리띠가 되리라.</p><p>그때 이리가 어린 양과 함께 살고, 표범이 새끼 염소와 함께 누우며, 송아지와 젊은 사자가 함께 풀을 뜯고, 어린 아이가 그들을 이끌리라.</p><p>암소와 곰이 함께 풀을 뜯고, 그들의 새끼들이 함께 누우며, 사자가 소처럼 건초를 먹으리라.</p><p>젖먹이 아이가 독사의 굴에서 놀고, 어린 아이가 독사의 구멍에 손을 넣으리라.</p><p>그들은 내 거룩한 산 어디에서도 해치거나 파괴하지 않으리라. 땅이 주님을 아는 지식으로 가득 차리니, 마치 물이 바다를 덮음 같으리라.</p>',
        'carol4-title': '다윗 성에 한 번',
        'carol4-subtitle': 'H.J. 건틀렛, 편곡 데이비드 윌콕스',
        'carol4-text': '<p class="verse"><strong>1절</strong><br>다윗 성에 한 번 낮은 외양간이 서 있었도다, 어머니가 그 아기를 구유에 눕혔도다:<br>마리아가 그 온화한 어머니였고, 예수 그리스도가 그 작은 아이였도다.</p><p class="verse"><strong>2절</strong><br>그가 하늘에서 땅으로 내려오셨도다, 모든 것의 하느님이시요 주님이시니, 그의 거처는 외양간이었고 그의 요람은 마구간이었도다; 가난하고 천하고 낮은 자들과 함께, 우리 거룩한 구주가 땅에서 살았도다.</p><p class="verse"><strong>3절</strong><br>그리고 그의 모든 놀라운 어린 시절 동안 그는 존경하고 순종하며, 사랑하고, 그 온화한 팔에 누워 있던 낮은 처녀를 지켰도다:<br>그리스도인 아이들은 모두 온화하고 순종하며 그처럼 선해야 하리라.</p><p class="verse"><strong>4절</strong><br>그는 우리 어린 시절의 본이시니, 날마다 우리처럼 자라셨고, 그는 작고 약하고 무력하셨으며, 우리처럼 눈물과 미소를 아셨도다; 그는 우리의 슬픔을 느끼시고 우리의 기쁨을 함께하시도다.</p><p class="verse"><strong>6절</strong><br>그 가난하고 낮은 외양간에서, 소들이 곁에 서 있는 곳에서 우리가 그를 보지 않으리라; 그러나 하늘에서, 하느님의 오른편 높은 곳에 앉으셨을 때; 별처럼 그의 자녀들이 면류관을 쓰고 모두 흰 옷을 입고 주위에서 기다리리라.</p>',
        'reading5-title': '누가복음 1:26-38',
        'reading5-subtitle': '성모 영보',
        'reading5-text': '<p>여섯째 달에 천사 가브리엘이 하느님께서 보내신 이로 갈릴래아의 나자렛이라는 동네에 가서, 다윗 집안의 요셉이라는 사람과 약혼한 동정녀에게 갔는데, 그 동정녀의 이름은 마리아였다.</p><p>그가 그녀에게 가서 말했다. "은총을 받은 이여, 기뻐하여라! 주님이 너와 함께 계시다."</p><p>그러나 그녀는 이 말씀에 크게 당황하여 어떤 인사인지 생각해 보았다.</p><p>그러자 천사가 그녀에게 말했다. "두려워하지 마라, 마리아야. 너는 하느님께 은총을 받았다. 보라, 네가 잉태하여 아들을 낳으리니 그 이름을 예수라 하여라.</p><p>그는 위대한 분이 되시고 지극히 높으신 분의 아들이라 불릴 것이며, 주 하느님께서 그에게 그의 아버지 다윗의 왕좌를 주시리라. 그는 야곱 집안을 영원히 다스리시고 그의 나라는 끝이 없을 것이다."</p><p>마리아가 천사에게 말했다. "이 일이 어떻게 될 수 있습니까? 저는 남자를 알지 못합니다."</p><p>천사가 그녀에게 대답하여 말했다. "성령이 네 위에 내리시고 지극히 높으신 분의 능력이 네를 덮으시리라. 그러므로 태어날 거룩한 아기는 하느님의 아들이라 불릴 것이다.</p><p>보라, 네 친척 엘리사벳도 늙은 나이에 아들을 잉태했는데, 그녀는 불임이라 불리던 이였고 지금은 여섯째 달이다. 하느님께는 불가능한 일이 없다."</p><p>마리아가 말했다. "보십시오, 주님의 여종입니다. 당신의 말씀대로 제게 이루어지기를 바랍니다." 그러자 천사가 그녀에게서 떠나갔다.</p>',
        'carol5-title': '아베 마리아',
        'carol5-subtitle': '자크 아르카델트, 16세기',
        'carol5-text': '<p>아베 마리아, 은총이 가득하신 분,<br>주님께서 당신과 함께 계시며,<br>여인들 가운데 당신이 복되시고,<br>당신 태중의 열매 예수도 복되시나이다.<br>거룩한 마리아, 하느님의 어머니,<br>우리 죄인을 위하여 빌어주시고,<br>지금 그리고 우리 죽음의 때에.<br>아멘.</p>',
        'reading6-title': '마태복음 1:18-25',
        'reading6-subtitle': '예수 그리스도의 탄생',
        'reading6-text': '<p>예수 그리스도의 탄생은 이러하였다. 그의 어머니 마리아가 요셉과 약혼하였는데, 그들이 함께 살기 전에 성령으로 잉태된 것이 드러났다.</p><p>그의 남편 요셉은 의로운 사람이었고, 그녀를 수치스럽게 하고 싶지 않아 조용히 이혼하려고 하였다.</p><p>그가 이렇게 생각하고 있을 때, 주님의 천사가 꿈에 나타나 말했다. "다윗의 자손 요셉아, 네 아내 마리아를 집으로 데려오는 것을 두려워하지 마라. 그녀가 잉태한 것은 성령으로 말미암은 것이다.</p><p>그녀가 아들을 낳으리니 그 이름을 예수라 하여라. 그가 자기 백성을 그들의 죄에서 구원할 것이다."</p><p>이 모든 일이 일어난 것은 주님께서 예언자를 통하여 하신 말씀을 이루려 하심이었다. "보라, 동정녀가 잉태하여 아들을 낳으리니 그 이름을 임마누엘이라 하리라." 이는 "하느님이 우리와 함께 계시다"는 뜻이다.</p><p>요셉이 잠에서 깨어나 주님의 천사가 명령한 대로 하여 그의 아내를 집으로 데려왔다. 그는 그녀가 아들을 낳을 때까지 그녀와 관계하지 않았고, 그가 태어난 아들의 이름을 예수라 하였다.</p>',
        'carol6-title': '고요한 밤',
        'carol6-subtitle': '프란츠 그루버, 편곡 존 러터',
        'carol6-text': '<p class="verse"><strong>1절</strong><br>고요한 밤, 거룩한 밤, 모든 것이 고요하고 밝도다, 저 처녀와 어머니와 아이 주위에, 거룩한 아기 그렇게 부드럽고 온화하도다, 하늘의 평화 속에서 잠들어라, 하늘의 평화 속에서 잠들어라.</p><p class="verse"><strong>2절</strong><br>고요한 밤, 거룩한 밤, 목자들이 그 광경에 떨도다; 영광이 멀리 하늘에서 흘러내리고, 하늘의 무리가 노래하도다: "할렐루야! 그리스도 구주가 태어나셨도다! 그리스도 구주가 태어나셨도다!"</p><p class="verse"><strong>3절</strong><br>고요한 밤, 거룩한 밤, 하느님의 아들, 사랑의 순수한 빛, 당신의 거룩한 얼굴에서 빛나는 광선이, 구원의 은총의 새벽과 함께, 예수, 주님, 당신의 탄생에, 예수, 주님, 당신의 탄생에.</p>',
        'reading7-title': '누가복음 2:8-20',
        'reading7-subtitle': '목자들에게 전해진 예수의 탄생 소식',
        'reading7-text': '<p>그 지역에 목자들이 있었는데, 들에서 밤을 지새우며 양 떼를 지키고 있었다.</p><p>주님의 천사가 그들에게 나타나고 주님의 영광이 그들을 둘러 비추니, 그들이 크게 두려워하였다.</p><p>천사가 그들에게 말했다. "두려워하지 마라. 보라, 내가 온 백성에게 큰 기쁨이 될 좋은 소식을 너희에게 전한다.</p><p>오늘 다윗의 성읍에 너희를 위한 구주가 태어나셨으니, 그분은 메시아이시요 주님이시다.</p><p>너희에게 표적이 있으니, 너희가 강보에 싸여 구유에 누워 있는 아기를 찾을 것이다."</p><p>갑자기 천사와 함께 하늘의 무리가 나타나 하느님을 찬양하며 말했다. "지극히 높은 곳에서는 하느님께 영광이요, 땅에서는 그분의 마음에 드는 사람들에게 평화로다."</p><p>천사들이 그들에게서 떠나 하늘로 올라갔을 때, 목자들이 서로 말했다. "자, 베들레헴으로 가서 주님께서 우리에게 알려주신 이 일이 일어난 것을 보자."</p><p>그들이 급히 가서 마리아와 요셉, 그리고 구유에 누워 있는 아기를 찾았다.</p><p>그들이 이것을 보고 이 아이에 대해 말해 준 소식을 전하였다.</p><p>이것을 들은 모든 사람이 목자들이 말한 것에 놀라워하였다.</p><p>마리아는 이 모든 일을 마음에 간직하며 되새겨 보았다.</p><p>그리고 목자들은 들려주신 대로 들은 것과 본 모든 일로 인해 하느님을 찬양하고 영광을 돌리며 돌아갔다.</p>',
        'carol7-title': '기쁘다 구주 오셨네',
        'carol7-subtitle': '펠릭스 멘델스존, 편곡 데이비드 윌콕스',
        'carol7-text': '<p class="verse"><strong>1절</strong><br>들으라! 전령 천사들이 노래하도다, "새로 태어난 왕께 영광이요; 땅에는 평화, 자비는 온화하도다, 하느님과 죄인이 화해하도다." 기쁘도다, 모든 민족들아, 일어나라, 하늘의 승리를 함께하라; 천사의 무리와 함께 선포하라, "그리스도가 베들레헴에서 태어나셨도다!" 들으라! 전령 천사들이 노래하도다, "새로 태어난 왕께 영광이요!"</p><p class="verse"><strong>2절</strong><br>그리스도, 가장 높은 하늘에서 경배받으시는 분, 그리스도, 영원한 주님, 때가 늦어 그가 오심을 보라, 동정녀 태중의 자손이시도다. 육체로 가려진 하느님을 보라; 성육신한 신성을 찬양하라, 기뻐하시며 사람으로 사람들과 함께 거하시도다, 예수, 우리의 임마누엘이시도다. 들으라! 전령 천사들이 노래하도다, "새로 태어난 왕께 영광이요!"</p><p class="verse"><strong>3절</strong><br>만세! 하늘에서 태어난 평화의 왕자여! 만세! 의의 아들이여! 모든 이에게 빛과 생명을 가져오시고, 그의 날개에 치유를 가지고 일어나셨도다. 온화하게 그의 영광을 내려놓으시고, 사람이 더 이상 죽지 않도록 태어나셨도다, 땅의 아들들을 일으키시려 태어나셨고, 그들에게 두 번째 탄생을 주시려 태어나셨도다. 들으라! 전령 천사들이 노래하도다, "새로 태어난 왕께 영광이요!"</p>',
        'reading8-title': '마태복음 2:1-12',
        'reading8-subtitle': '동방 박사들의 방문',
        'reading8-text': '<p>예수께서 유다의 베들레헴에서 태어나셨을 때, 헤로데 왕의 시대에 동방에서 온 박사들이 예루살렘에 도착하여 말했다. "유다인의 새로 태어난 왕이 어디 계십니까? 우리가 그의 별이 떠오르는 것을 보고 그에게 경배하러 왔습니다."</p><p>헤로데 왕이 이것을 듣고 크게 당황하였고, 온 예루살렘도 그와 함께 당황하였다.</p><p>모든 대사제와 백성의 서기관들을 모아 놓고 그들에게 메시아가 어디서 태어날 것인지 물었다.</p><p>그들이 그에게 말했다. "유다의 베들레헴입니다. 예언자를 통하여 이렇게 기록되어 있기 때문입니다. \'유다 땅 베들레헴아, 너는 유다의 통치자들 가운데 결코 가장 작은 자가 아니다. 너에게서 내 백성 이스라엘을 다스릴 통치자가 나올 것이다.\'"</p><p>그러자 헤로데가 박사들을 몰래 불러 별이 나타난 때를 정확히 알아냈다.</p><p>그는 그들을 베들레헴으로 보내며 말했다. "가서 그 아이를 부지런히 찾아라. 그를 찾으면 나에게 알려주어라. 나도 가서 그에게 경배하겠다."</p><p>왕과의 면담 후 그들이 길을 떠났다. 그들이 떠오르는 것을 본 그 별이 그들 앞에서 가다가 아이가 있는 곳 위에 멈추었다.</p><p>그들이 별을 보고 크게 기뻐하며, 집에 들어가 마리아와 함께 있는 아이를 보았다. 그들이 엎드려 그에게 경배하였다.</p><p>그리고 그들이 보물 상자를 열어 그에게 금과 유향과 몰약을 선물로 드렸다.</p><p>그리고 그들이 꿈에 헤로데에게 돌아가지 말라는 경고를 받아 다른 길로 자기 나라로 돌아갔다.</p>',
        'carol8-title': '인 둘치 주빌로',
        'carol8-subtitle': '고대 독일 성가, 편곡 R. L. 피어솔',
        'carol8-text': '<p class="verse"><strong>1절</strong><br>달콤한 환호 속에서, 우리의 경배를 보이자: 우리 마음의 기쁨이 구유에 누워 있도다; 그리고 밝은 별처럼 어머니의 품에서 빛나시도다, 알파와 오메가시도다!</p><p class="verse"><strong>2절</strong><br>오 예수, 작은 아이여, 내가 항상 당신을 그리워하도다! 나를 들으소서, 당신께 간청하나이다, 오 최고의 아이여; 내 기도가 당신께 닿기를, 오 영광의 왕자여! 나를 당신 뒤로 이끄소서!</p><p class="verse"><strong>3절</strong><br>오 아버지의 사랑이여! 오 아들의 온화함이여! 우리는 우리의 죄로 깊이 더럽혔도다; 그러나 당신이 우리를 위해 하늘의 기쁨을 얻으셨도다. — 오 우리가 거기 있었더라면! — 오 우리가 거기 있었더라면!</p><p class="verse"><strong>4절</strong><br>기쁨이 어디 있나, 어디에, 그것들이 거기에 있지 않다면? 천사들이 새로운 노래를 부르고 있도다; 거기 종들이 울리고 있도다, 왕의 궁정에서. — 오 우리가 거기 있었더라면! — 오 우리가 거기 있었더라면!</p>',
        'reading9-title': '요한복음 1:1-14',
        'reading9-subtitle': '말씀이 육신이 되셨도다',
        'reading9-text': '<p>태초에 말씀이 계셨고, 말씀이 하느님과 함께 계셨으며, 말씀은 하느님이셨다.</p><p>그는 태초에 하느님과 함께 계셨다.</p><p>모든 것이 그를 통하여 생겨났고, 그 없이 생겨난 것은 하나도 없다. 그를 통하여 생겨난 것은 생명이었고, 이 생명은 인간의 빛이었다. 빛이 어둠 속에서 빛나고 있으나 어둠이 그것을 이기지 못하였다.</p><p>요한이라는 사람이 하느님께로부터 보내심을 받았다. 그는 증언을 위하여 왔으니, 빛에 대하여 증언하려 함이었다. 그래서 모든 사람이 그를 통하여 믿게 하려 함이었다. 그는 그 빛이 아니었고, 그 빛에 대하여 증언하러 온 자였다.</p><p>모든 사람을 비추는 참빛이 세상에 오고 있었다.</p><p>그는 세상에 계셨고, 세상은 그를 통하여 생겨났지만, 세상은 그를 알지 못하였다.</p><p>그는 자기 것에게 오셨지만, 자기 백성은 그를 받아들이지 않았다.</p><p>그러나 그를 받아들인 이들에게는, 그의 이름을 믿는 이들에게는, 하느님의 자녀가 되는 권한을 주셨다. 그들은 혈통으로나 육정으로나 사람의 뜻으로 나지 않고 하느님에게서 태어났다.</p><p>말씀이 육신이 되어 우리 가운데 거하셨다. 우리는 그의 영광을 보았는데, 아버지의 외아들의 영광이요, 은총과 진리가 충만하신 분의 영광이었다.</p>',
        'carol9-title': '오라 모든 신실한 자들',
        'carol9-subtitle': '존 프랜시스 웨이드, 편곡 데이비드 윌콕스',
        'carol9-text': '<p class="verse"><strong>1절</strong><br>오라, 모든 신실한 자들아, 기쁘고 승리하도다, 오라, 오라 베들레헴으로; 와서 그를 보라, 천사들의 왕으로 태어나셨도다.</p><p class="refrain"><strong>후렴:</strong> 오라, 우리가 그를 경배하자, 오라, 우리가 그를 경배하자, 오라, 우리가 그를 경배하자, 그리스도 주님이여.</p><p class="verse"><strong>2절</strong><br>하느님 중의 하느님, 빛 중의 빛, 보라! 그는 동정녀의 태를 싫어하지 않으셨도다; 참 하느님, 낳으신 분, 창조되지 않으셨도다.</p><p class="verse"><strong>6절</strong><br>노래하라, 천사들의 합창단이여, 환호하며 노래하라, 노래하라, 위 하늘의 모든 시민들이여! 지극히 높은 곳에서 하느님께 영광이요.</p><p class="verse"><strong>7절</strong><br>그렇다, 주님, 우리가 당신을 인사하나이다, 이 기쁜 아침에 태어나셨도다, 예수여, 당신께 영광이 있기를; 아버지의 말씀이시여, 이제 육신으로 나타나셨도다!</p>',
        'closing-title': '마침 기도 및 마지막 성가 – 첫 번째 노엘',
        'closing-subtitle': '전통적인 영국 성가',
        'closing-text': '<p class="verse"><strong>1절</strong><br>첫 번째 노엘 천사가 말했도다, 들에 누워 있던 가난한 목자들에게; 그들이 양을 지키며 누워 있던 들에서, 매우 추운 겨울 밤에.</p><p class="refrain"><strong>후렴:</strong> 노엘, 노엘, 노엘, 노엘, 이스라엘의 왕이 태어나셨도다.</p><p class="verse"><strong>2절</strong><br>그들이 올려다보니 동쪽에 별이 빛나고 있었도다, 그들로부터 멀리; 그리고 땅에 큰 빛을 주었도다, 그래서 그것이 낮과 밤 계속되었도다.</p><p class="verse"><strong>3절</strong><br>그리고 그 같은 별의 빛으로, 세 명의 현자가 먼 나라에서 왔도다; 왕을 찾는 것이 그들의 의도였고, 별이 어디로 가든 그것을 따랐도다.</p><p class="verse"><strong>4절</strong><br>이 별이 서북쪽으로 가까이 와서, 베들레헴 위에서 쉬었도다; 그리고 거기서 멈추고 머물렀도다, 바로 예수께서 누워 계신 곳 위에.</p><p class="verse"><strong>5절</strong><br>그때 그 세 명의 현자가 들어왔도다, 매우 경건하게 무릎을 꿇고, 그리고 거기서 그의 앞에 그들의 금과 몰약과 유향을 드렸도다.</p>',
        'feedback-title': '피드백',
        'feedback-content': '<p>이 예배에 대한 피드백을 환영합니다.</p><p><a href="https://forms.gle/PQ7d4zRT9yns6YaK7?embedded=true" target="_blank">피드백을 제공하려면 여기를 클릭하세요</a></p>',
        'feedback-text': '이 예배에 대한 여러분의 생각을 듣고 싶습니다.',
        'feedback-link': '피드백 제공',
        'feedback-url': 'https://forms.gle/PQ7d4zRT9yns6YaK7',
        'info-title': '복스 사크라 소개',
        'info-mission': '<p>주님께서 주신 달란트를 사랑과 나눔의 성음악으로 승화시켜 하느님께 영광을 드리는 것—이것이 <b>Vox Sacra Ensemble</b> 의사명입니다.</p><p>뉴욕에 거주하는 천주교 신자들로 이루어진 저희는 음악에 대한 열정을 바탕으로, 가톨릭 전통의 뿌리 깊은 성음악에서 부터 우리 시대의 가톨릭 음악 까지 폭넓게 연주하고 있습니다.</p><p>또한 피정, 자선 음악회, 전례 음악 등 다양한 사도적 활동을 통해 음악 안에서 복음을 선포하는 소명을 꾸준히 실천하고자 합니다. 앞으로도 저희가 펼쳐 나갈 사도직과 음악 활동에 많은 격려와 응원, 그리고 기도로 함께해 주시기를 바랍니다.</p><p><i>* 단 원 이 되 고 싶 으 시 거 나 후 원 회 원 이 되 고 싶 은 분 은 아 래 의 링 크 를 참 조 해 주 세 요</i></p>',
        'sponsorship-button': '복스 사크라 후원하기',
        'sponsorship-url': 'https://forms.gle/PQ7d4zRT9yns6YaK7',
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

