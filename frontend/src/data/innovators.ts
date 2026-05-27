export interface Innovator {
  id: string;
  name: string;
  role: string;
  country: string;
  quote: string;
  image: string;
  bio: string;
  contributions: string[];
}

export const INNOVATORS: Innovator[] = [
  {
    id: "india",
    name: "Dr. A. P. J. Abdul Kalam",
    role: "Aerospace Scientist & 11th President",
    country: "India",
    quote: "Dream, dream, dream. Dreams transform into thoughts and thoughts result in action.",
    image: "https://upload.wikimedia.org/wikipedia/commons/b/b0/A._P._J._Abdul_Kalam.jpg",
    bio: "Avul Pakir Jainulabdeen Abdul Kalam was an Indian aerospace scientist and statesman who served as the 11th President of India from 2002 to 2007. He was born and raised in Rameswaram, Tamil Nadu and studied physics and aerospace engineering.",
    contributions: [
      "Played a crucial organizational, technical, and political role in India's Pokhran-II nuclear tests.",
      "Known as the Missile Man of India for his work on the development of ballistic missile and launch vehicle technology.",
      "Advocated for education and youth empowerment worldwide."
    ]
  },
  {
    id: "uk",
    name: "Alan Turing",
    role: "Mathematician & Computer Scientist",
    country: "UK",
    quote: "Sometimes it is the people no one can imagine anything of who do the things no one can imagine.",
    image: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Alan_Turing_Aged_16.jpg",
    bio: "Alan Mathison Turing was an English mathematician, computer scientist, logician, cryptanalyst, philosopher, and theoretical biologist. Turing was highly influential in the development of theoretical computer science.",
    contributions: [
      "Providing a formalisation of the concepts of algorithm and computation with the Turing machine.",
      "Crucial role in cracking intercepted coded messages that enabled the Allies to defeat the Axis powers in many crucial engagements during WWII.",
      "Considered to be the father of theoretical computer science and artificial intelligence."
    ]
  },
  {
    id: "usa",
    name: "Grace Hopper",
    role: "Computer Scientist & Naval Officer",
    country: "USA",
    quote: "A ship in port is safe, but that's not what ships are built for.",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/37/Grace_Hopper_and_UNIVAC.jpg",
    bio: "Grace Brewster Murray Hopper was an American computer scientist and United States Navy rear admiral. One of the first programmers of the Harvard Mark I computer, she was a pioneer of computer programming.",
    contributions: [
      "Invented one of the first linkers.",
      "Popularized the idea of machine-independent programming languages, which led to the development of COBOL.",
      "Coined the term 'debugging' after finding an actual moth in a computer."
    ]
  },
  {
    id: "sa",
    name: "Nelson Mandela",
    role: "Anti-apartheid Revolutionary & President",
    country: "South Africa",
    quote: "It always seems impossible until it's done.",
    image: "https://upload.wikimedia.org/wikipedia/commons/0/02/Nelson_Mandela_1994.jpg",
    bio: "Nelson Rolihlahla Mandela was a South African anti-apartheid revolutionary, political leader and philanthropist who served as President of South Africa from 1994 to 1999. He was the country's first black head of state.",
    contributions: [
      "Dismantled the legacy of apartheid by tackling institutionalised racism and fostering racial reconciliation.",
      "Served as President of the African National Congress (ANC) party from 1991 to 1997.",
      "Globally regarded as an icon of democracy and social justice."
    ]
  },
  {
    id: "germany",
    name: "Albert Einstein",
    role: "Theoretical Physicist",
    country: "Germany",
    quote: "Imagination is more important than knowledge. For knowledge is limited, whereas imagination embraces the entire world.",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Einstein_1921_by_F_Schmutzer_-_restoration.jpg",
    bio: "Albert Einstein was a German-born theoretical physicist, widely acknowledged to be one of the greatest and most influential physicists of all time. He is best known for developing the theory of relativity.",
    contributions: [
      "Developed the theory of relativity, one of the two pillars of modern physics.",
      "Mass–energy equivalence formula E = mc².",
      "Discovered the law of the photoelectric effect, a pivotal step in the development of quantum theory."
    ]
  },
  {
    id: "poland",
    name: "Marie Curie",
    role: "Physicist and Chemist",
    country: "Poland",
    quote: "Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.",
    image: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Marie_Curie_c._1920s.jpg",
    bio: "Marie Salomea Skłodowska–Curie was a Polish and naturalized-French physicist and chemist who conducted pioneering research on radioactivity.",
    contributions: [
      "First woman to win a Nobel Prize, and the only person to win a Nobel Prize in two scientific fields.",
      "Discovered the elements polonium and radium.",
      "Pioneered the development of mobile radiography units to provide X-ray services to field hospitals."
    ]
  },
  {
    id: "china",
    name: "Tu Youyou",
    role: "Pharmaceutical Chemist & Malariologist",
    country: "China",
    quote: "Every scientist dreams of doing something that can help the world.",
    image: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Tu_Youyou_2011.jpg",
    bio: "Tu Youyou is a Chinese pharmaceutical chemist and malariologist. She discovered artemisinin (also known as qinghaosu) and dihydroartemisinin, used to treat malaria, a breakthrough in twentieth-century tropical medicine.",
    contributions: [
      "Discovered artemisinin, saving millions of lives worldwide, especially in the developing world.",
      "Awarded the Nobel Prize in Physiology or Medicine in 2015.",
      "First Chinese Nobel laureate in physiology or medicine and the first female citizen of the PRC to receive a Nobel Prize."
    ]
  },
  {
    id: "kenya",
    name: "Wangari Maathai",
    role: "Environmental & Political Activist",
    country: "Kenya",
    quote: "It's the little things citizens do. That's what will make the difference. My little thing is planting trees.",
    image: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Wangari_Maathai_2001.jpg",
    bio: "Wangari Muta Maathai was a Kenyan social, environmental and political activist and the first African woman to win the Nobel Peace Prize.",
    contributions: [
      "Founded the Green Belt Movement, an environmental non-governmental organization focused on the planting of trees, environmental conservation, and women's rights.",
      "Planted over 30 million trees across Africa.",
      "Empowered thousands of women through grassroots community organizing."
    ]
  },
  {
    id: "japan",
    name: "Satoshi Omura",
    role: "Biochemist",
    country: "Japan",
    quote: "I have always believed that microorganisms hold the key to solving many of humanity's problems.",
    image: "https://upload.wikimedia.org/wikipedia/commons/1/1d/Satoshi_Omura_2015.jpg",
    bio: "Satoshi Ōmura is a Japanese biochemist. He is known for the discovery and development of various naturally occurring microorganisms, particularly avermectin, which revolutionized the treatment of parasitic diseases.",
    contributions: [
      "Discovered the bacterium that produces avermectin.",
      "His work led to the development of ivermectin, a drug that has nearly eradicated river blindness and lymphatic filariasis.",
      "Awarded the 2015 Nobel Prize in Physiology or Medicine."
    ]
  },
  {
    id: "brazil",
    name: "Oswaldo Cruz",
    role: "Physician & Bacteriologist",
    country: "Brazil",
    quote: "Faith in science is the only faith that will save us.",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/36/Oswaldo_Cruz_1903.jpg",
    bio: "Oswaldo Gonçalves Cruz was a Brazilian physician, pioneer bacteriologist, epidemiologist and public health officer and the founder of the Oswaldo Cruz Institute.",
    contributions: [
      "Eradicated yellow fever, bubonic plague, and smallpox in Rio de Janeiro at the turn of the 20th century.",
      "Founded experimental medicine in Brazil.",
      "His institute became the cornerstone of Brazilian public health research."
    ]
  },
  // Continuing with 40 more to hit 50 countries...
  { id: "france", name: "Louis Pasteur", role: "Biologist & Chemist", country: "France", quote: "Science knows no country, because knowledge belongs to humanity.", image: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Albert_Edelfelt_-_Louis_Pasteur_-_1885.jpg", bio: "Renowned for discoveries of the principles of vaccination, microbial fermentation, and pasteurization.", contributions: ["Invented pasteurization.", "Developed vaccines for rabies and anthrax."] },
  { id: "italy", name: "Galileo Galilei", role: "Astronomer & Physicist", country: "Italy", quote: "You cannot teach a man anything; you can only help him find it within himself.", image: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Galileo.arp.300pix.jpg", bio: "A central figure in the transition from natural philosophy to modern science.", contributions: ["Telescopic confirmation of the phases of Venus.", "Discovery of the four largest satellites of Jupiter.", "Observation of sunspots."] },
  { id: "russia", name: "Dmitri Mendeleev", role: "Chemist", country: "Russia", quote: "There is nothing in this world that I fear to say.", image: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Dmitri_Mendeleev_1890s.jpg", bio: "Russian chemist and inventor.", contributions: ["Formulated the Periodic Law.", "Created a farsighted version of the periodic table of elements.", "Predicted the properties of elements yet to be discovered."] },
  { id: "canada", name: "Frederick Banting", role: "Medical Scientist", country: "Canada", quote: "Insulin does not belong to me, it belongs to the world.", image: "https://upload.wikimedia.org/wikipedia/commons/1/15/Frederick_Banting_1923.jpg", bio: "Canadian medical scientist, physician, painter, and Nobel laureate.", contributions: ["Co-discoverer of insulin.", "First person to use insulin on humans to treat diabetes.", "Youngest Nobel laureate in Physiology/Medicine."] },
  { id: "australia", name: "Howard Florey", role: "Pharmacologist & Pathologist", country: "Australia", quote: "People sometimes think that I and the others worked on penicillin because we were interested in suffering humanity. I don't think it ever crossed our minds about suffering humanity.", image: "https://upload.wikimedia.org/wikipedia/commons/9/91/Howard_Florey.jpg", bio: "Australian pharmacologist and pathologist who shared the Nobel Prize in Physiology or Medicine in 1945.", contributions: ["Carried out the first clinical trials of penicillin.", "Instrumental in the extraction and purification of penicillin.", "Saved millions of lives during and after WWII."] },
  { id: "mexico", name: "Mario Molina", role: "Chemist", country: "Mexico", quote: "The scientists only can warn. It is up to the rest of the society to decide what to do.", image: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Mario_Molina_2011.jpg", bio: "Mexican chemist and a prominent figure in the discovery of the Antarctic ozone hole.", contributions: ["Discovered the threat of CFCs to the ozone layer.", "Co-recipient of the 1995 Nobel Prize in Chemistry.", "His work led to the Montreal Protocol."] },
  { id: "egypt", name: "Ahmed Zewail", role: "Chemist", country: "Egypt", quote: "Science is a core value of human society.", image: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Ahmed_Zewail_HD2006_O.jpg", bio: "Egyptian-American scientist, known as the 'father of femtochemistry'.", contributions: ["Pioneered femtochemistry (studying chemical reactions across femtoseconds).", "Awarded the 1999 Nobel Prize in Chemistry.", "First Egyptian to win a scientific Nobel Prize."] },
  { id: "argentina", name: "René Favaloro", role: "Cardiac Surgeon", country: "Argentina", quote: "We must be aware that the medical profession is a social endeavor.", image: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Ren%C3%A9_Favaloro_%28portrait%29.jpg", bio: "Argentine cardiac surgeon and educator.", contributions: ["Pioneered coronary artery bypass surgery.", "Established the Favaloro Foundation.", "Revolutionized cardiovascular surgery globally."] },
  { id: "spain", name: "Santiago Ramón y Cajal", role: "Neuroscientist", country: "Spain", quote: "Any man could, if he were so inclined, be the sculptor of his own brain.", image: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Cajal-Restored.jpg", bio: "Spanish neuroscientist and pathologist, specializing in the neuroanatomy of the central nervous system.", contributions: ["Discovered the neuron doctrine.", "Pioneered modern neuroscience.", "Nobel Prize in Physiology or Medicine 1906."] },
  { id: "sweden", name: "Alfred Nobel", role: "Chemist & Engineer", country: "Sweden", quote: "If I have a thousand ideas and only one turns out to be good, I am satisfied.", image: "https://upload.wikimedia.org/wikipedia/commons/0/03/Alfred_Nobel.jpg", bio: "Swedish chemist, engineer, inventor, businessman, and philanthropist.", contributions: ["Invented dynamite.", "Bequeathed his fortune to institute the Nobel Prizes.", "Held 355 different patents."] },
  { id: "switzerland", name: "Carl Jung", role: "Psychiatrist & Psychoanalyst", country: "Switzerland", quote: "Who looks outside, dreams; who looks inside, awakes.", image: "https://upload.wikimedia.org/wikipedia/commons/1/11/CGJung.jpg", bio: "Swiss psychiatrist and psychoanalyst who founded analytical psychology.", contributions: ["Concepts of extraversion and introversion.", "Theory of the collective unconscious.", "Concept of synchronicity."] },
  { id: "netherlands", name: "Antonie van Leeuwenhoek", role: "Microbiologist", country: "Netherlands", quote: "My work... was not pursued in order to gain the praise I now enjoy, but chiefly from a craving after knowledge.", image: "https://upload.wikimedia.org/wikipedia/commons/9/94/Jan_Verkolje_-_Antonie_van_Leeuwenhoek.jpg", bio: "Dutch businessman and scientist in the Golden Age of Dutch science and technology.", contributions: ["Father of Microbiology.", "Discovered infusoria, bacteria, and spermatozoa.", "Greatly improved the microscope."] },
  { id: "austria", name: "Lise Meitner", role: "Physicist", country: "Austria", quote: "Science makes people reach selflessly for truth and objectivity.", image: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Lise_Meitner_1906.jpg", bio: "Austrian-Swedish physicist who contributed to the discoveries of the element protactinium and nuclear fission.", contributions: ["Co-discovered nuclear fission of uranium.", "Discovered the element protactinium.", "Refused to work on the atomic bomb."] },
  { id: "new_zealand", name: "Ernest Rutherford", role: "Physicist", country: "New Zealand", quote: "All science is either physics or stamp collecting.", image: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Ernest_Rutherford_LOC.jpg", bio: "New Zealand-born British physicist who came to be known as the father of nuclear physics.", contributions: ["Discovered the concept of radioactive half-life.", "Theorized the Rutherford model of the atom.", "Discovered the proton."] },
  { id: "denmark", name: "Niels Bohr", role: "Physicist", country: "Denmark", quote: "An expert is a person who has made all the mistakes that can be made in a very narrow field.", image: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Niels_Bohr.jpg", bio: "Danish physicist who made foundational contributions to understanding atomic structure and quantum theory.", contributions: ["Developed the Bohr model of the atom.", "Proposed the principle of complementarity.", "Nobel Prize in Physics in 1922."] },
  { id: "scotland", name: "Alexander Fleming", role: "Biologist & Pharmacologist", country: "Scotland", quote: "One sometimes finds what one is not looking for.", image: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Alexander_Fleming_1945.jpg", bio: "Scottish physician and microbiologist, best known for discovering the world's first broadly effective antibiotic substance.", contributions: ["Discovered penicillin.", "Discovered the enzyme lysozyme.", "Nobel Prize in Physiology or Medicine in 1945."] },
  { id: "ireland", name: "Ernest Walton", role: "Physicist", country: "Ireland", quote: "A scientist should be a good citizen.", image: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Ernest_T.S._Walton.jpg", bio: "Irish physicist and Nobel laureate for his work with John Cockcroft with 'atom-smashing' experiments.", contributions: ["First person in history to artificially split the atom.", "Co-invented the Cockcroft-Walton generator.", "Nobel Prize in Physics in 1951."] },
  { id: "pakistan", name: "Abdus Salam", role: "Theoretical Physicist", country: "Pakistan", quote: "Scientific thought is the common heritage of mankind.", image: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Abdus_Salam_1987.jpg", bio: "Pakistani theoretical physicist and a Nobel Prize laureate.", contributions: ["Major contribution to the electroweak unification theory.", "First Pakistani and first Muslim from an Islamic country to receive a Nobel Prize in Science.", "Founded the International Centre for Theoretical Physics."] },
  { id: "iran", name: "Maryam Mirzakhani", role: "Mathematician", country: "Iran", quote: "The beauty of mathematics only shows itself to more patient followers.", image: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Maryam_Mirzakhani.jpg", bio: "Iranian mathematician and a professor of mathematics at Stanford University.", contributions: ["First and only woman to win the Fields Medal (the highest award in mathematics).", "Breakthrough research on the dynamics and geometry of Riemann surfaces.", "Advanced the study of moduli spaces."] },
  { id: "colombia", name: "Rodolfo Llinás", role: "Neuroscientist", country: "Colombia", quote: "The brain is an entity that simulates reality.", image: "https://upload.wikimedia.org/wikipedia/commons/2/27/Rodolfo_Llinas.jpg", bio: "Colombian-American neuroscientist.", contributions: ["Pioneered the study of the physiology of the single neuron in the brain.", "Discovered dendritic calcium spikes.", "Contributed to understanding cerebellar function."] },
  { id: "peru", name: "Pedro Paulet", role: "Aerospace Engineer", country: "Peru", quote: "Peru has to be a great power in the world.", image: "https://upload.wikimedia.org/wikipedia/commons/8/82/Pedro_Paulet.jpg", bio: "Peruvian scientist, pioneer of aviation and space travel.", contributions: ["Invented the liquid-propellant rocket engine.", "Considered by some as the father of modern astronautics.", "Designed early conceptual spacecraft."] },
  { id: "chile", name: "Humberto Maturana", role: "Biologist & Philosopher", country: "Chile", quote: "We are biologically constituted so that we can only live in love.", image: "https://upload.wikimedia.org/wikipedia/commons/0/05/Humberto_Maturana_%282014%29.jpg", bio: "Chilean biologist and philosopher.", contributions: ["Co-created the theory of autopoiesis.", "Pioneered radical constructivist epistemology.", "Deeply influenced cybernetics and systems theory."] },
  { id: "greece", name: "George Papanikolaou", role: "Physician", country: "Greece", quote: "The first aim of science is to find the truth.", image: "https://upload.wikimedia.org/wikipedia/commons/1/1a/George_Papanicolaou_1962.jpg", bio: "Greek pioneer in cytopathology and early cancer detection.", contributions: ["Invented the Pap smear.", "Revolutionized the early detection of cervical cancer.", "Saved millions of women's lives globally."] },
  { id: "turkey", name: "Aziz Sancar", role: "Biochemist", country: "Turkey", quote: "Most people believe that intelligence is the most important thing. It is not. The most important thing is hard work.", image: "https://upload.wikimedia.org/wikipedia/commons/3/30/Aziz_Sancar.jpg", bio: "Turkish-American biochemist and molecular biologist.", contributions: ["Mapped the mechanism cells use to repair UV-damaged DNA.", "Nobel Prize in Chemistry in 2015.", "Advanced cancer treatment research."] },
  { id: "israel", name: "Ada Yonath", role: "Crystallographer", country: "Israel", quote: "I didn't want to be a scientist to win the Nobel Prize, I wanted to understand how things work.", image: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Ada_Yonath_2015.jpg", bio: "Israeli crystallographer best known for her pioneering work on the structure of the ribosome.", contributions: ["First Middle Eastern woman to win a Nobel prize in the sciences.", "Determined the 3D structure of the ribosome.", "Pioneered cryo bio-crystallography."] },
  { id: "south_korea", name: "Hwang Woo-suk", role: "Biotechnologist", country: "South Korea", quote: "Science is the pursuit of truth.", image: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Hwang_Woo-suk.jpg", bio: "South Korean veterinarian and researcher.", contributions: ["Created the world's first cloned dog, Snuppy.", "Pioneered early (though controversial) stem cell research.", "Advanced animal cloning techniques."] }, // Kept brief, recognized figure.
  { id: "indonesia", name: "B. J. Habibie", role: "Engineer & 3rd President", country: "Indonesia", quote: "Without love, intelligence is dangerous; without intelligence, love is not enough.", image: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Bacharuddin_Jusuf_Habibie_official_portrait.jpg", bio: "Indonesian engineer and politician who was the third president of Indonesia.", contributions: ["Pioneered Indonesia's aerospace industry.", "Developed the Habibie Factor in thermodynamics.", "Designed the N-250 turboprop aircraft."] },
  { id: "vietnam", name: "Ngô Bảo Châu", role: "Mathematician", country: "Vietnam", quote: "Math is an art.", image: "https://upload.wikimedia.org/wikipedia/commons/4/46/Ngo_Bao_Chau_2010.jpg", bio: "Vietnamese-French mathematician at the University of Chicago.", contributions: ["Proved the fundamental lemma for automorphic forms.", "First Vietnamese national to receive the Fields Medal.", "Advanced the Langlands program."] },
  { id: "malaysia", name: "Mazlan Othman", role: "Astrophysicist", country: "Malaysia", quote: "Space is a dimension for human development.", image: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Mazlan_Othman.jpg", bio: "Malaysian astrophysicist who has served as Director of the United Nations Office for Outer Space Affairs.", contributions: ["Pioneered Malaysia's space program.", "Created the curriculum for astrophysics at the National University of Malaysia.", "Oversaw the deployment of Malaysia's first astronaut."] },
  { id: "philippines", name: "Fe del Mundo", role: "Pediatrician", country: "Philippines", quote: "I am glad that I have been very much involved in the care of children.", image: "https://upload.wikimedia.org/wikipedia/en/2/23/Fe_del_Mundo.jpg", bio: "Filipina pediatrician, the founder of the first pediatric hospital in the Philippines.", contributions: ["Invented a bamboo incubator.", "First woman admitted to Harvard Medical School.", "Revolutionized Philippine public healthcare."] },
  { id: "thailand", name: "Puey Ungphakorn", role: "Economist", country: "Thailand", quote: "Integrity is the essence of public service.", image: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Puey_Ungphakorn.jpg", bio: "Thai bureaucrat and economist who played a central role in the shaping of Thailand's economic development.", contributions: ["Modernized Thailand's financial system.", "Governor of the Bank of Thailand.", "Fought for democratic reforms."] },
  { id: "singapore", name: "Lee Kuan Yew", role: "Statesman", country: "Singapore", quote: "I have no regrets. I have spent my life, so much of it, building up this country.", image: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Lee_Kuan_Yew_1993_%28cropped%29.jpg", bio: "Singaporean statesman and lawyer who served as the first Prime Minister of Singapore.", contributions: ["Transformed Singapore from a developing outpost into a highly developed global city.", "Pioneered public housing and anti-corruption measures.", "Recognized as the founding father of modern Singapore."] },
  { id: "bangladesh", name: "Muhammad Yunus", role: "Economist & Entrepreneur", country: "Bangladesh", quote: "Poverty is not created by the poor. It is created by the institutions we have built.", image: "https://upload.wikimedia.org/wikipedia/commons/8/87/Muhammad_Yunus_2012.jpg", bio: "Bangladeshi social entrepreneur, banker, economist, and civil society leader.", contributions: ["Founded Grameen Bank.", "Pioneered the concepts of microcredit and microfinance.", "Awarded the Nobel Peace Prize in 2006."] },
  { id: "sri_lanka", name: "Arthur C. Clarke", role: "Science Fiction Writer & Futurist", country: "Sri Lanka", quote: "Any sufficiently advanced technology is indistinguishable from magic.", image: "https://upload.wikimedia.org/wikipedia/commons/3/34/Arthur_C._Clarke_1965.jpg", bio: "British science fiction writer, science writer, futurist, inventor, undersea explorer, and television series host who lived most of his life in Sri Lanka.", contributions: ["Co-wrote the screenplay for 2001: A Space Odyssey.", "Popularized the concept of geostationary communication satellites.", "Visionary predictions of modern technology."] },
  { id: "nepal", name: "Sanduk Ruit", role: "Ophthalmologist", country: "Nepal", quote: "Restoring sight is the greatest gift you can give a human being.", image: "https://upload.wikimedia.org/wikipedia/commons/d/dd/Sanduk_Ruit_2016.jpg", bio: "Nepalese ophthalmologist who has restored the sight of over 130,000 people across Africa and Asia.", contributions: ["Pioneered a low-cost cataract surgery technique.", "Co-founded the Tilganga Institute of Ophthalmology.", "Manufactures high-quality intraocular lenses at a fraction of the global cost."] },
  { id: "nigeria", name: "Philip Emeagwali", role: "Computer Scientist", country: "Nigeria", quote: "The internet is the ultimate global network.", image: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Philip_Emeagwali.jpg", bio: "Nigerian computer scientist who won the 1989 Gordon Bell Prize.", contributions: ["Used a Connection Machine supercomputer to help analyze petroleum fields.", "Pioneer in distributed computing.", "Inspired a generation of African tech professionals."] },
  { id: "ghana", name: "Kofi Annan", role: "Diplomat", country: "Ghana", quote: "To live is to choose. But to choose well, you must know who you are and what you stand for.", image: "https://upload.wikimedia.org/wikipedia/commons/a/af/Kofi_Annan.jpg", bio: "Ghanaian diplomat who served as the seventh Secretary-General of the United Nations.", contributions: ["Reformed the UN bureaucracy.", "Launched the Global Compact.", "Awarded the Nobel Peace Prize in 2001."] },
  { id: "ethiopia", name: "Tewolde Berhan Gebre Egziabher", role: "Environmental Scientist", country: "Ethiopia", quote: "Biodiversity is the basis of life.", image: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Tewolde_Berhan_Gebre_Egziabher.jpg", bio: "Ethiopian scientist and environmentalist.", contributions: ["Drafted the African Model Law to protect the rights of local communities.", "Key negotiator at the Convention on Biological Diversity.", "Won the Right Livelihood Award."] },
  { id: "saudi_arabia", name: "Hayat Sindi", role: "Medical Scientist", country: "Saudi Arabia", quote: "Science is a universal language.", image: "https://upload.wikimedia.org/wikipedia/commons/2/29/Hayat_Sindi.jpg", bio: "Saudi Arabian medical scientist and one of the first female members of the Consultative Assembly of Saudi Arabia.", contributions: ["Co-invented the MARS diagnostic tool.", "Founded the i2 Institute for invention.", "UNESCO Goodwill Ambassador for Sciences."] },
  { id: "uae", name: "Sarah Al Amiri", role: "Computer Engineer", country: "UAE", quote: "The impossible is not in our dictionary.", image: "https://upload.wikimedia.org/wikipedia/commons/8/86/Sarah_Al_Amiri.jpg", bio: "Emirati government minister and chairperson of the UAE Space Agency.", contributions: ["Lead the Hope Mars Mission.", "Transformed the UAE's knowledge economy.", "Advocate for youth in STEM."] },
  { id: "cuba", name: "Carlos Finlay", role: "Epidemiologist", country: "Cuba", quote: "The mosquito is the true enemy.", image: "https://upload.wikimedia.org/wikipedia/commons/4/41/Carlos_J_Finlay.jpg", bio: "Cuban epidemiologist recognized as a pioneer in the research of yellow fever.", contributions: ["First to theorize that a mosquito was a carrier of yellow fever.", "Saved thousands of lives during the construction of the Panama Canal.", "Pioneered modern epidemiology vectors."] },
  { id: "hungary", name: "John von Neumann", role: "Mathematician & Polymath", country: "Hungary", quote: "Young man, in mathematics you don't understand things. You just get used to them.", image: "https://upload.wikimedia.org/wikipedia/commons/5/5e/JohnvonNeumann-LosAlamos.gif", bio: "Hungarian-American mathematician, physicist, computer scientist, and polymath.", contributions: ["Founded game theory.", "Created the von Neumann architecture for computers.", "Key contributor to the Manhattan Project."] },
  { id: "norway", name: "Fridtjof Nansen", role: "Explorer & Scientist", country: "Norway", quote: "The difficult is what takes a little time; the impossible is what takes a little longer.", image: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Fridtjof_Nansen_1915.jpg", bio: "Norwegian explorer, scientist, diplomat and humanitarian.", contributions: ["Pioneered Arctic exploration.", "Invented the Nansen bottle for oceanography.", "Created the Nansen passport for stateless refugees, winning the Nobel Peace Prize."] },
  { id: "belgium", name: "Georges Lemaître", role: "Physicist & Astronomer", country: "Belgium", quote: "The evolution of the world can be compared to a display of fireworks that has just ended.", image: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Georges_Lema%C3%AEtre.jpg", bio: "Belgian Catholic priest, mathematician, astronomer, and professor of physics.", contributions: ["Proposed the Big Bang theory.", "Derived Hubble's law.", "Pioneered the application of general relativity to cosmology."] },
  { id: "portugal", name: "António Egas Moniz", role: "Neurologist", country: "Portugal", quote: "Medicine is a science of uncertainty and an art of probability.", image: "https://upload.wikimedia.org/wikipedia/commons/9/91/Ant%C3%B3nio_Egas_Moniz.jpg", bio: "Portuguese neurologist and the developer of cerebral angiography.", contributions: ["Invented cerebral angiography to map blood vessels in the brain.", "Awarded the Nobel Prize in Physiology or Medicine in 1949.", "A founding figure of modern psychosurgery."] },
  { id: "venezuela", name: "Baruj Benacerraf", role: "Immunologist", country: "Venezuela", quote: "To be a scientist is to be a student forever.", image: "https://upload.wikimedia.org/wikipedia/commons/a/af/Baruj_Benacerraf.jpg", bio: "Venezuelan-American immunologist.", contributions: ["Discovered the major histocompatibility complex (MHC).", "Awarded the 1980 Nobel Prize in Physiology or Medicine.", "Fundamentally explained autoimmune diseases."] }
];
