// Zenith Empire — BIO 102 Study App — Core Application Logic
// Handles navigation, profile, bookmarks, weak areas, calculator, and the exam engine.

(function() {
  // Global States
  let navHistory = ['screen-home'];
  let currentSection = null;
  let currentSubtopic = null;
  let bookmarks = JSON.parse(localStorage.getItem('study-bookmarks') || '[]');
  let weakAreas = JSON.parse(localStorage.getItem('study-weakareas') || '[]');
  
  // User Profile
  let userProfile = JSON.parse(localStorage.getItem('study-profile') || JSON.stringify({
    name: "Victor Okafor",
    age: "19",
    dept: "Medical Laboratory Science",
    uni: "FUAHSE"
  }));

  // CBT Exam State
  let cbtQuestions = [];
  let cbtCurrentIndex = 0;
  let cbtAnswers = {}; // questionIndex -> selectedOptionIndex
  let cbtTimerInterval = null;
  let cbtTimeLeft = 45 * 60; // 45 minutes in seconds

  // Practice State
  let practiceQuestions = [];
  let practiceCurrentIndex = 0;
  let practiceAnswers = {};
  let isPracticeActive = false;

  // Test Yourself State
  let tyQuestions = [];
  let tyCurrentIndex = 0;
  let tyAnswers = {};
  let isTyActive = false;

  // Active quiz variables for single subtopic quizzes
  let pqiQuestions = [];
  let pqiCurrentIndex = 0;
  let pqiAnswers = {};
  let pqiScore = { correct: 0, wrong: 0 };

  // ==========================================
  // 1. QUESTION BANK (High Probability FUAHSE Exam Questions)
  // ==========================================
  const questionBank = {
    1: [ // Microbiology
      {
        question: "Which of the following is a characteristic of viruses that distinguishes them from living organisms?",
        options: ["They possess cellular organelles", "They can reproduce only inside a host cell", "They undergo binary fission", "They have both DNA and RNA simultaneously"],
        answer: 1,
        explanation: "Viruses are obligate intracellular parasites that lack cellular structure and require a living host machinery to replicate. They contain either DNA or RNA, but never both."
      },
      {
        question: "In Gram staining, what is the function of iodine?",
        options: ["Primary stain", "Counterstain", "Decolorizer", "Mordant"],
        answer: 3,
        explanation: "Iodine acts as a mordant, forming an insoluble crystal violet-iodine complex that gets trapped in the thick peptidoglycan wall of Gram-positive bacteria."
      },
      {
        question: "Which fungal group is commonly known as 'conjugation fungi' or 'bread moulds'?",
        options: ["Zygomycota", "Ascomycota", "Basidiomycota", "Deuteromycota"],
        answer: 0,
        explanation: "Zygomycota includes Rhizopus stolonifer (black bread mould), which reproduces sexually via zygospores formed during conjugation."
      },
      {
        question: "Bacterial cells possess which of the following cell wall materials?",
        options: ["Chitin", "Cellulose", "Peptidoglycan", "Pectin"],
        answer: 2,
        explanation: "Bacterial cell walls are made of peptidoglycan (also called murein). Fungi cell walls are made of chitin, and plant cell walls are made of cellulose."
      },
      {
        question: "Which viral replication cycle results in the integration of viral DNA into the host genome as a prophage?",
        options: ["Lytic cycle", "Lysogenic cycle", "Budding cycle", "Conjugation cycle"],
        answer: 1,
        explanation: "In the lysogenic cycle, the viral DNA integrates into the host's chromosome and replicates silently without immediately destroying the cell."
      }
    ],
    2: [ // Plant Kingdom Survey
      {
        question: "Which division of the plant kingdom is considered 'the amphibians of the plant world' due to their reliance on water for fertilization?",
        options: ["Thallophyta", "Bryophyta", "Pteridophyta", "Gymnospermae"],
        answer: 1,
        explanation: "Bryophytes (mosses and liverworts) lack vascular tissues and require liquid water to allow flagellated sperms to swim to the egg."
      },
      {
        question: "Which of the following plants displays dominant sporophyte generation and is the first to possess true vascular tissues (xylem & phloem)?",
        options: ["Mosses", "Spirogyra", "Ferns (Pteridophyta)", "Pinus"],
        answer: 2,
        explanation: "Pteridophytes (ferns) are the first terrestrial plants to evolve true vascular tissue (tracheophytes) and possess a dominant diploid sporophyte phase."
      },
      {
        question: "Gymnosperms are characterized by which feature?",
        options: ["Naked seeds in cones", "Double fertilization", "Vessel elements in xylem", "Flowers with sepals and petals"],
        answer: 0,
        explanation: "Gymnosperms ('naked seeds') produce seeds on the surface of cone scales, rather than enclosed within an ovary/fruit as seen in angiosperms."
      },
      {
        question: "A plant with parallel venation, fibrous roots, and floral parts in multiples of three is classified as a:",
        options: ["Dicotyledon", "Monocotyledon", "Gymnosperm", "Bryophyte"],
        answer: 1,
        explanation: "Monocots have parallel venation, fibrous roots, single cotyledon, and trimerous flowers. Dicots have net venation, taproots, two cotyledons, and tetramerous/pentamerous flowers."
      },
      {
        question: "What is the green, cup-like structure used for asexual reproduction in liverworts (Bryophytes)?",
        options: ["Archegonia", "Antheridia", "Gemma cup", "Rhizoid"],
        answer: 2,
        explanation: "Gemma cups are cup-like structures on the dorsal thallus of liverworts (like Marchantia) containing gemmae, which are multicellular asexual vegetative propagules."
      }
    ],
    3: [ // Animal Kingdom Survey
      {
        question: "Which phylum is characterized by having a pseudocoelom (false body cavity)?",
        options: ["Platyhelminthes", "Nematoda", "Annelida", "Arthropoda"],
        answer: 1,
        explanation: "Nematodes (roundworms) are pseudocoelomates because their body cavity is not fully lined by mesoderm. Platyhelminthes are acoelomate, and Annelids/Arthropods are coelomate."
      },
      {
        question: "Which of the following organisms possesses a water vascular system used for locomotion, respiration, and food capture?",
        options: ["Starfish (Echinodermata)", "Jellyfish (Coelenterata)", "Snail (Mollusca)", "Tapeworm (Platyhelminthes)"],
        answer: 0,
        explanation: "Echinoderms, like starfish and sea urchins, are unique in possessing a hydraulic water vascular system terminated in tube feet."
      },
      {
        question: "Which class of Chordates is characterized by being homeothermic, possessing amniotic eggs, feathers, and hollow bones?",
        options: ["Amphibia", "Reptilia", "Aves", "Mammalia"],
        answer: 2,
        explanation: "Aves (birds) are warm-blooded (homeothermic), have feathers, light/pneumatic hollow bones, and lay cleidoic amniotic eggs."
      },
      {
        question: "The presence of cnidocytes (stinging cells) is the defining feature of which phylum?",
        options: ["Porifera", "Coelenterata (Cnidaria)", "Nematoda", "Platyhelminthes"],
        answer: 1,
        explanation: "Coelenterates (or Cnidaria, like Hydra and jellyfish) are named after their specialized stinging cells called cnidocytes (containing nematocysts)."
      },
      {
        question: "Which of the following is an excretory organ found in Arthropods like insects?",
        options: ["Flame cells", "Nephridia", "Malpighian tubules", "Kidney"],
        answer: 2,
        explanation: "Malpighian tubules are the primary excretory and osmoregulatory organs of insects and other arachnids. Flame cells are in flatworms, and nephridia are in earthworms."
      }
    ],
    4: [ // Ecological Adaptations
      {
        question: "Plants adapted to live in extremely dry habitats are called:",
        options: ["Hydrophytes", "Mesophytes", "Xerophytes", "Halophytes"],
        answer: 2,
        explanation: "Xerophytes have adaptations like sunken stomata, thick waxy cuticles, and water-storage tissues to survive arid desert conditions."
      },
      {
        question: "In an ecosystem, what percentage of energy is typically transferred from one trophic level to the next?",
        options: ["1%", "10%", "50%", "90%"],
        answer: 1,
        explanation: "Lindeman's 10% law of energy transfer states that only about 10% of the energy stored as biomass in one trophic level is passed on to the next."
      },
      {
        question: "Which zone represents the dry, northernmost savanna vegetation belt in Nigeria, characterized by thorny acacia trees and low rainfall?",
        options: ["Guinea Savanna", "Sudan Savanna", "Sahel Savanna", "Derived Savanna"],
        answer: 2,
        explanation: "The Sahel Savanna is the desert-fringe northernmost belt of Nigeria, with sparse vegetation, extreme dryness, and sandy dunes."
      },
      {
        question: "What role do Rhizobium bacteria play when inhabiting the root nodules of leguminous plants?",
        options: ["Decomposition", "Parasitism", "Symbiotic nitrogen fixation", "Nitrification"],
        answer: 2,
        explanation: "Rhizobium has a mutualistic symbiotic relationship with legumes, converting atmospheric nitrogen into ammonia in exchange for carbon and energy."
      },
      {
        question: "An association where one organism benefits while the other is unaffected is called:",
        options: ["Mutualism", "Commensalism", "Parasitism", "Amensalism"],
        answer: 1,
        explanation: "Commensalism is a positive-neutral relationship (+/0), e.g., epiphytic orchids on forest tree trunks."
      }
    ],
    5: [ // Nutrition
      {
        question: "Which phase of photosynthesis takes place in the stroma and does not directly require light?",
        options: ["Light reactions", "Photolysis of water", "Calvin-Benson cycle", "Non-cyclic photophosphorylation"],
        answer: 2,
        explanation: "The light-independent reactions (Calvin Cycle) happen in the chloroplast stroma, fixing CO2 into carbohydrates using ATP and NADPH from light reactions."
      },
      {
        question: "Which mineral deficiency in plants causes 'chlorosis' (yellowing of leaves due to lack of chlorophyll)?",
        options: ["Magnesium", "Calcium", "Boron", "Phosphorus"],
        answer: 0,
        explanation: "Magnesium (Mg) is the central atom in the chlorophyll molecule; its deficiency directly halts chlorophyll synthesis, leading to interveinal chlorosis."
      },
      {
        question: "Which digestive enzyme secreted in the stomach of human infants acts on milk proteins?",
        options: ["Pepsin", "Amylase", "Rennin", "Trypsin"],
        answer: 2,
        explanation: "Rennin (chymosin) curdles milk by converting soluble caseinogen to insoluble calcium caseinate, allowing other enzymes to digest it."
      },
      {
        question: "What mode of nutrition involves feeding on dead and decaying organic matter?",
        options: ["Holozoic", "Saprophytic", "Parasitic", "Autotrophic"],
        answer: 1,
        explanation: "Saprophytes (mushrooms, bread mould, bacteria) release extracellular enzymes to digest decaying matter before absorbing nutrients."
      },
      {
        question: "The carbohydrate digestive enzyme 'ptyalin' is secreted by which organ in humans?",
        options: ["Gastric glands", "Salivary glands", "Pancreas", "Intestinal glands"],
        answer: 1,
        explanation: "Ptyalin is salivary amylase, secreted by the salivary glands into the oral cavity to initiate starch breakdown."
      }
    ],
    6: [ // Respiration
      {
        question: "Glycolysis takes place in which part of the cell?",
        options: ["Mitochondrial matrix", "Cristae", "Cytoplasm", "Chloroplast"],
        answer: 2,
        explanation: "Glycolysis (anaerobic breakdown of glucose to pyruvate) takes place in the cytosol/cytoplasm of both prokaryotes and eukaryotes."
      },
      {
        question: "What is the net ATP yield of aerobic respiration from one molecule of glucose in ideal eukaryotic cells?",
        options: ["2 ATP", "36 to 38 ATP", "4 ATP", "120 ATP"],
        answer: 1,
        explanation: "Aerobic respiration generates a theoretical maximum of 36 to 38 ATP per glucose, whereas anaerobic respiration only yields a net of 2 ATP."
      },
      {
        question: "In insects, gaseous exchange occurs through which specialized structure?",
        options: ["Gills", "Book lungs", "Tracheoles and spiracles", "Skin"],
        answer: 2,
        explanation: "Insects have a tracheal system. Air enters through external spiracles and travels down trachea and tracheoles directly to tissues."
      }
    ],
    7: [ // Circulatory Systems
      {
        question: "Which blood group is considered the 'universal donor' in blood transfusions?",
        options: ["Group A", "Group B", "Group AB", "Group O"],
        answer: 3,
        explanation: "Group O RBCs have neither A nor B antigens on their surface, so they won't trigger an immune attack in recipients. Blood group AB is the universal recipient."
      },
      {
        question: "In the human heart, which valve prevents the backflow of blood from the left ventricle into the left atrium?",
        options: ["Tricuspid valve", "Bicuspid (mitral) valve", "Aortic semilunar valve", "Pulmonary semilunar valve"],
        answer: 1,
        explanation: "The bicuspid or mitral valve guards the left atrioventricular opening. The tricuspid valve is on the right side."
      },
      {
        question: "The mechanism of water transport in xylem is best explained by which theory?",
        options: ["Pressure-Flow hypothesis", "Cohesion-Tension theory", "Active transport", "Capillarity alone"],
        answer: 1,
        explanation: "Dixon's cohesion-tension theory explains that transpiration pull creates a tension that draws water upward, aided by water's high cohesive and adhesive properties."
      }
    ],
    8: [ // Excretion
      {
        question: "Which of the following is the functional unit of the human kidney?",
        options: ["Neuron", "Nephron", "Alveolus", "Ureter"],
        answer: 1,
        explanation: "The nephron is the structural and functional unit of the kidney, responsible for filtration, reabsorption, and urine formation."
      },
      {
        question: "Ultrafiltration in the kidney occurs at which exact structure?",
        options: ["Loop of Henle", "Malpighian corpuscle (Glomerulus & Bowman's capsule)", "Distal convoluted tubule", "Collecting duct"],
        answer: 1,
        explanation: "High pressure in glomerular capillaries forces water and solutes across the fenestrated wall into Bowman's capsule, a process called ultrafiltration."
      },
      {
        question: "Excretory structures called 'flame cells' are found in which phylum?",
        options: ["Nematoda", "Platyhelminthes", "Annelida", "Arthropoda"],
        answer: 1,
        explanation: "Flame cells (protonephridia) are primitive excretory structures found in Platyhelminthes (flatworms) like planarians."
      }
    ],
    9: [ // Reproduction
      {
        question: "What process is characterized by the fusion of one male gamete with the egg and another male gamete with the polar nuclei in angiosperms?",
        options: ["Self-pollination", "Double fertilization", "Apomixis", "Parthenogenesis"],
        answer: 1,
        explanation: "Double fertilization is unique to flowering plants. One sperm fertilizes the egg (forming the zygote), and the other fertilizes the two polar nuclei (forming the triploid endosperm)."
      },
      {
        question: "Which hormone is primarily responsible for triggering ovulation in the human menstrual cycle?",
        options: ["Estrogen", "Progesterone", "FSH (Follicle Stimulating Hormone)", "LH (Luteinizing Hormone)"],
        answer: 3,
        explanation: "An 'LH surge' around day 14 of the cycle directly triggers the rupture of the mature Graafian follicle, releasing the secondary oocyte (ovulation)."
      },
      {
        question: "Animals that lay eggs which develop outside the mother's body are termed:",
        options: ["Viviparous", "Oviparous", "Ovoviviparous", "Parthenocarpic"],
        answer: 1,
        explanation: "Oviparous animals (like birds and reptiles) lay eggs. Viviparous animals give birth to live young, and ovoviviparous animals hatch eggs inside the mother's body."
      }
    ],
    10: [ // Growth & Development
      {
        question: "Which plant growth hormone is responsible for apical dominance, phototropism, and cell elongation?",
        options: ["Gibberellin", "Cytokinin", "Auxin (IAA)", "Abscisic acid (ABA)"],
        answer: 2,
        explanation: "Auxins are synthesized in shoot tips and promote cell elongation, bend stems toward light, and inhibit lateral buds (apical dominance)."
      },
      {
        question: "What type of seed germination raises the cotyledons above the soil level due to rapid elongation of the hypocotyl?",
        options: ["Epigeal", "Hypogeal", "Apical", "Basal"],
        answer: 0,
        explanation: "In epigeal germination, the hypocotyl elongates, pulling the cotyledons out of the soil (e.g. beans). In hypogeal germination, the epicotyl elongates, keeping cotyledons below ground (e.g. maize)."
      },
      {
        question: "A sigmoid growth curve features which phases in sequence?",
        options: ["Lag phase, Log phase, Stationary phase, Decline", "Log phase, Lag phase, Stationary phase", "Apical phase, Lateral phase, Terminal phase", "Exponential phase, Log phase, Lag phase"],
        answer: 0,
        explanation: "A standard biological growth curve shows an S-shape (sigmoid) consisting of slow initial growth (lag), rapid cell division (log/exponential), a leveling off (stationary), and finally senescence/death (decline)."
      }
    ]
  };

  // Helper to fetch questions for a specific section
  function getQuestionsForSection(sectionId) {
    return questionBank[sectionId] || questionBank[1]; // fallback to section 1
  }

  // ==========================================
  // 2. FALLBACK STUDY MATERIAL GENERATOR
  // ==========================================
  const fallbackTopicsData = {
    "3": { // Animal Kingdom
      overview: "The animal kingdom is comprised of eukaryotic, multicellular, heterotrophic organisms lacking cell walls. They are classified based on embryological origin, symmetry, coelom, and structural features.",
      tables: [
        {
          title: "Invertebrate Phyla Key Traits",
          headers: ["Phylum", "Example", "Key Diagnostic Features"],
          rows: [
            ["Porifera", "Sponges", "Pore-bearing, cellular level of organization, collar cells, spicules"],
            ["Coelenterata", "Hydra, Jellyfish", "Diploblastic, tissue level, radial symmetry, cnidocytes (stinging cells)"],
            ["Platyhelminthes", "Tapeworm", "Triploblastic, acoelomate, bilateral symmetry, flame cells for excretion"],
            ["Nematoda", "Ascaris (Roundworm)", "Pseudocoelomate, tubular body, hydrostatic skeleton"],
            ["Annelida", "Earthworm", "Metamerically segmented, true coelom, nephridia for excretion"],
            ["Mollusca", "Snail", "Soft unsegmented body, muscular foot, mantle, radula"],
            ["Arthropoda", "Crab, Housefly", "Jointed appendages, chitinous exoskeleton, open circulatory system"],
            ["Echinodermata", "Starfish", "Pentaradiate symmetry, water vascular system, tube feet"]
          ]
        },
        {
          title: "Chordate Classes (Vertebrates)",
          headers: ["Class", "Example", "Heart Chambers", "Body Temperature", "Key Traits"],
          rows: [
            ["Pisces", "Tilapia", "2 chambers", "Cold-blooded (Poikilothermic)", "Gills, scales, fins, aquatic"],
            ["Amphibia", "Toad", "3 chambers", "Cold-blooded (Poikilothermic)", "Moist skin, double life (aquatic larvae, terrestrial adult)"],
            ["Reptilia", "Lizard", "3 chambers (partial septum)", "Cold-blooded (Poikilothermic)", "Dry scaly skin, amniotic eggs"],
            ["Aves", "Pigeon", "4 chambers", "Warm-blooded (Homeothermic)", "Feathers, beak, wings, hollow bones"],
            ["Mammalia", "Human", "4 chambers", "Warm-blooded (Homeothermic)", "Mammary glands, hair/fur, sweat glands"]
          ]
        }
      ],
      summary: [
        "Animals are categorized into Invertebrates (no backbone) and Vertebrates (Chordates with vertebrae).",
        "Key classification parameters: Symmetry (Asymmetrical, Radial, Bilateral), Coelom (Acoelomate, Pseudocoelomate, Coelomate), Germ Layers (Diploblastic, Triploblastic).",
        "Arthropoda is the largest phylum in the animal kingdom, dominated by insects."
      ],
      traps: [
        "Insects have Malpighian tubules; Earthworms have Nephridia; Flatworms have Flame cells.",
        "Nematodes have a false body cavity (pseudocoelom) - a major examiner favorite."
      ],
      mistakes: [
        "Thinking jellyfish is a true fish. It belongs to Coelenterata, not Pisces.",
        "Confusing Poikilotherms (body temp varies with environment) with Homeotherms (regulate own temp)."
      ]
    },
    "4": { // Ecological Adaptations
      overview: "Ecology is the study of interactions between organisms and their environment. Adaptations are morphological, physiological, or behavioral traits that enhance survival.",
      tables: [
        {
          title: "Plant Adaptations",
          headers: ["Type", "Habitat", "Key Morphological Adaptations"],
          rows: [
            ["Xerophytes", "Deserts (Dry)", "Thick waxy cuticles, sunken stomata, rolled leaves, succulent water stems"],
            ["Hydrophytes", "Aquatic (Water)", "Lack cuticle, poorly developed root system, abundant aerenchyma tissue"],
            ["Halophytes", "Saline (Salt marsh)", "Salt-secreting glands, pneumatophores (breathing roots)"],
            ["Mesophytes", "Terrestrial (Normal)", "Well-developed roots, broad thin leaves with stomata on lower surface"]
          ]
        }
      ],
      summary: [
        "Ecosystem structures consist of Biotic (producers, consumers, decomposers) and Abiotic (light, temp, soil, wind) factors.",
        "Food webs are complex networks of food chains, illustrating trophic interactions.",
        "Biogeochemical cycles (Carbon, Nitrogen, Water) drive nutrient recycling on Earth."
      ],
      traps: [
        "Pneumatophores are specialized breathing roots found in swamp/mangrove halophytes, not xerophytes.",
        "Nitrogen fixation is conducted by Rhizobium in leguminous plant root nodules, converting N2 to ammonia."
      ],
      mistakes: [
        "Thinking energy pyramids can be inverted. Pyramids of numbers/biomass can be inverted, but energy pyramids are ALWAYS upright due to thermodynamics."
      ]
    },
    "5": { // Nutrition
      overview: "Nutrition is the process by which living organisms acquire nutrients for energy, growth, and tissue repair.",
      tables: [
        {
          title: "Modes of Nutrition",
          headers: ["Mode", "Mechanism", "Examples"],
          rows: [
            ["Autotrophic", "Synthesizes organic food from inorganic raw materials", "Green plants, algae, cyanobacteria"],
            ["Holozoic", "Ingests solid food, digests it internally", "Humans, dogs, amoeba"],
            ["Saprophytic", "Extracellular digestion of dead organic matter", "Mucor, mushrooms, yeast"],
            ["Parasitic", "Derives nutrients from a living host, causing harm", "Plasmodium, tapeworm, dodder plant"]
          ]
        },
        {
          title: "Human Digestive Enzymes",
          headers: ["Enzyme", "Source Gland", "Substrate", "End Product"],
          rows: [
            ["Ptyalin (Amylase)", "Salivary Glands", "Starch", "Maltose"],
            ["Pepsin", "Gastric Glands", "Proteins", "Peptones"],
            ["Rennin", "Gastric Glands", "Milk protein (caseinogen)", "Insoluble curd (casein)"],
            ["Amylase", "Pancreas", "Starch", "Maltose"],
            ["Trypsin", "Pancreas", "Proteins", "Peptides"],
            ["Lipase", "Pancreas/Intestine", "Fats", "Fatty acids & glycerol"]
          ]
        }
      ],
      summary: [
        "Photosynthesis consists of Light-dependent (grana) and Light-independent (stroma, Calvin cycle) phases.",
        "Plants require Macronutrients (N, P, K, Mg, Ca) in large amounts and Micronutrients (Fe, Zn, B, Cu) in trace amounts.",
        "Interveinal chlorosis (yellowing of leaves) in plants is mostly caused by Magnesium deficiency."
      ],
      traps: [
        "Rennin is a stomach enzyme in infants that curdles milk, distinct from Renin (a kidney hormone/enzyme).",
        "Bile contains NO enzymes but is critical for emulsifying fats to increase surface area for lipase."
      ],
      mistakes: [
        "Confusing saprophytes with parasites. Saprophytes feed on dead matter; parasites feed on living hosts."
      ]
    },
    "6": { // Respiration
      overview: "Respiration is the cellular biochemical breakdown of glucose to release energy (ATP). It occurs in both aerobic (with oxygen) and anaerobic (without oxygen) states.",
      tables: [
        {
          title: "Aerobic vs Anaerobic Respiration",
          headers: ["Feature", "Aerobic Respiration", "Anaerobic Respiration"],
          rows: [
            ["Oxygen Requirement", "Strictly required", "Not required"],
            ["Net ATP Yield", "36 to 38 ATP per glucose", "2 ATP per glucose"],
            ["Location", "Cytoplasm & Mitochondria", "Cytoplasm only"],
            ["End Products", "CO2, H2O, and ATP", "Lactic acid (animals) or Ethanol & CO2 (plants/yeast)"]
          ]
        }
      ],
      summary: [
        "Aerobic pathway: Glycolysis (cytosol) -> Link reaction -> Krebs Cycle (mitochondrial matrix) -> Electron Transport Chain (cristae).",
        "Respiratory Quotient (RQ) is the ratio of CO2 produced to O2 consumed. Carbs = 1.0, Proteins = 0.9, Fats = 0.7.",
        "Gaseous exchange organs: Lungs (mammals), Gills (fish), Spiracles/Tracheoles (insects), Stomata/Lenticels (plants)."
      ],
      traps: [
        "Glycolysis is common to both aerobic and anaerobic pathways and does not require oxygen.",
        "Fats have a lower RQ (0.7) because they require more oxygen for complete oxidation than carbs."
      ],
      mistakes: [
        "Confusing respiration (cellular ATP generation) with breathing (mechanical ventilation)."
      ]
    }
  };

  // Default content fallback for any section or topic not explicitly defined
  function generateFallbackContent(code) {
    const parts = code.split('.');
    const sectionNum = parts[0] || "3";
    const subtopicNum = parts[1] || "1";
    
    // Find section metadata
    const sectionObj = sectionsData.find(s => s.id == parseInt(sectionNum));
    const subtopicObj = sectionObj ? sectionObj.subtopics.find(st => st.code === `${sectionNum}.${subtopicNum}`) : null;
    
    const title = subtopicObj ? subtopicObj.title : `Topic ${code}`;
    const sub = subtopicObj ? subtopicObj.sub : "Syllabus reading material";
    const sectionTitle = sectionObj ? sectionObj.title : "General Biology II";

    // Load custom static text or generate mock text if not in mock database
    const customData = fallbackTopicsData[sectionNum] || {
      overview: `Detailed reading notes and analysis for ${title} under ${sectionTitle}. This module is optimized to follow the latest FUAHSE BIO 102 curriculum.`,
      tables: [
        {
          title: "Important Definitions and Key Comparisons",
          headers: ["Concept", "Description / Function", "Exam Importance"],
          rows: [
            ["Primary Core", `Defines the fundamental mechanism of ${title}`, "Highly tested"],
            ["Associated Traits", "Morphological and anatomical traits specific to this taxa", "Critical diagnostic indicator"],
            ["Nigerian Context", "Locally available examples and practical biology lab specimens", "Key for practical exams"]
          ]
        }
      ],
      summary: [
        `This subtopic covers the foundational structures and mechanisms of ${title}.`,
        "Make sure to study the diagrams and review diagnostic features.",
        "Compare with related organisms in surrounding chapters."
      ],
      traps: [
        `Examiners frequently test the primary diagnostic features of ${title}.`,
        "Do not confuse early stage structures with mature reproductive organs.",
        "Always memorize the exact scientific naming spelling for practical write-ups."
      ],
      mistakes: [
        "Incorrect spelling of scientific names (e.g. not capitalizing Genus name or underling).",
        "Mixing up physiological pathways under varying environmental stresses."
      ]
    };

    // Render notes HTML
    let notesHTML = `
      <div style="font-size:14px; line-height:1.6; color:var(--white);">
        <p style="margin-bottom:16px;">${customData.overview}</p>
        <h2 style="font-family:var(--font-display); font-size:16px; font-weight:700; color:var(--teal); margin:20px 0 10px;">Detailed Study Review</h2>
        <p style="margin-bottom:16px;">Focus heavily on the diagnostic structures and their ecological correlations. This is a crucial section for the upcoming semester examinations.</p>
    `;

    // Add tables if they exist
    customData.tables.forEach(table => {
      notesHTML += `
        <h3 style="font-size:13px; font-weight:700; color:var(--gold); margin:14px 0 8px;">${table.title}</h3>
        <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:12px; border:1px solid var(--border-dim);">
          <thead>
            <tr style="background:rgba(232,168,32,0.06);">
      `;
      table.headers.forEach(header => {
        notesHTML += `<th style="padding:10px; border:1px solid var(--border-dim); text-align:left; color:var(--white);">${header}</th>`;
      });
      notesHTML += `</tr></thead><tbody>`;
      table.rows.forEach(row => {
        notesHTML += `<tr>`;
        row.forEach(cell => {
          notesHTML += `<td style="padding:10px; border:1px solid var(--border-dim); color:var(--muted-bright);">${cell}</td>`;
        });
        notesHTML += `</tr>`;
      });
      notesHTML += `</tbody></table>`;
    });

    notesHTML += `</div>`;

    return {
      notes: [{ type: "raw", html: notesHTML }],
      summary: customData.summary,
      traps: customData.traps,
      mistakes: customData.mistakes
    };
  }

  // Retrieve correct subtopic data (real or dynamic)
  function getSubtopicContent(code) {
    if (typeof subtopicContent !== 'undefined' && subtopicContent[code]) {
      return subtopicContent[code];
    }
    return generateFallbackContent(code);
  }

  // ==========================================
  // 3. UI RENDERING & SYSTEM BOOT
  // ==========================================

  // Render navigation lists for sections
  function renderSections() {
    const listContainer = document.getElementById('sections-list');
    if (!listContainer) return;

    let html = '';
    sectionsData.forEach(sec => {
      // Find read progress
      let readCount = 0;
      sec.subtopics.forEach(st => {
        if (localStorage.getItem(`read-${st.code}`)) readCount++;
      });
      const percent = Math.round((readCount / sec.subtopics.length) * 100);
      const isDone = percent === 100;
      
      let checkIcon = isDone 
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M20 6L9 17l-5-5"/></svg>`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><circle cx="12" cy="12" r="10"/></svg>`;

      html += `
        <div class="topic-item" onclick="openSectionDetail(${sec.id})">
          <div class="topic-num">${sec.id}</div>
          <div class="topic-info">
            <div class="topic-name">Section ${sec.id} — ${sec.title}</div>
            <div class="topic-meta">${sec.sub}</div>
          </div>
          <div class="topic-check">
            ${checkIcon}
          </div>
        </div>
      `;
    });
    listContainer.innerHTML = html;
  }

  // Open single section page details
  window.openSectionDetail = function(sectionId) {
    const section = sectionsData.find(s => s.id === sectionId);
    if (!section) return;

    currentSection = section;
    document.getElementById('section-detail-page-title').textContent = `Section ${sectionId}`;
    
    // Header section stats
    let readCount = 0;
    section.subtopics.forEach(st => {
      if (localStorage.getItem(`read-${st.code}`)) readCount++;
    });
    const percent = Math.round((readCount / section.subtopics.length) * 100);

    const detailHeader = document.querySelector('#screen-section-detail .scroll-area') || document.querySelector('#screen-section-detail');
    
    // Render detail section template
    let listHTML = '';
    section.subtopics.forEach((st, idx) => {
      const isRead = localStorage.getItem(`read-${st.code}`);
      const doneClass = isRead ? 'done' : '';
      listHTML += `
        <div class="subtopic-item ${doneClass}" onclick="openSubtopicDetail(${sectionId}, '${st.code}')">
          <div class="subtopic-dot"></div>
          <div class="subtopic-code">${st.code}</div>
          <div class="subtopic-info">
            <div class="subtopic-title">${st.title}</div>
            <div class="subtopic-meta">${st.sub}</div>
          </div>
          <div class="subtopic-chevron">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </div>
        </div>
      `;
    });

    // Populate the details page
    const sdSubtopics = document.getElementById('sd-subtopics');
    if (sdSubtopics) sdSubtopics.innerHTML = listHTML;

    // Set Section Info Card fields
    const titleEl = document.getElementById('sd-card-title') || document.createElement('div');
    const subEl = document.getElementById('sd-card-sub') || document.createElement('div');
    const badgeEl = document.getElementById('sd-card-badge') || document.createElement('div');
    const progEl = document.getElementById('sd-card-prog') || document.createElement('div');

    titleEl.textContent = section.title;
    subEl.textContent = section.sub;
    badgeEl.textContent = `BIO 102 · Section ${sectionId} of 10`;
    if (progEl) progEl.style.width = `${percent}%`;

    // Practice button in section detail screen
    const practiceBox = document.getElementById('sd-practice-btn-container') || document.createElement('div');
    practiceBox.innerHTML = `
      <button class="btn-outline-block" style="margin-top:16px;" onclick="startSectionPractice(${sectionId})">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px; height:16px; stroke:var(--gold);"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        Practice Section ${sectionId} Questions
      </button>
    `;

    navTo('screen-section-detail', 'screen-sections');
  };

  // Open a single subtopic read page
  window.openSubtopicDetail = function(sectionId, code) {
    const section = sectionsData.find(s => s.id === sectionId);
    if (!section) return;

    const subtopic = section.subtopics.find(st => st.code === code);
    if (!subtopic) return;

    currentSection = section;
    currentSubtopic = subtopic;

    // Save as read progress
    localStorage.setItem(`read-${code}`, 'true');
    renderSections(); // update main progress indicators

    // Set Header titles
    document.getElementById('subtopic-page-title').textContent = code;
    document.getElementById('stopic-badge').textContent = `Section ${sectionId} · Subtopic ${code}`;
    document.getElementById('stopic-title').textContent = subtopic.title;
    document.getElementById('stopic-sub').textContent = subtopic.sub;

    // Load active reading notes
    const content = getSubtopicContent(code);
    
    // Render Notes Tab
    const notesContainer = document.getElementById('stab-notes');
    if (notesContainer) {
      let notesHTML = '';
      content.notes.forEach(note => {
        if (note.type === 'p') {
          notesHTML += `<p style="font-size:14px; line-height:1.6; color:var(--muted-bright); margin-bottom:14px;">${note.text}</p>`;
        } else if (note.type === 'h2') {
          notesHTML += `<h2 style="font-family:var(--font-display); font-size:17px; font-weight:700; color:var(--teal); margin:20px 0 10px;">${note.text}</h2>`;
        } else if (note.type === 'h3') {
          notesHTML += `<h3 style="font-size:14px; font-weight:700; color:var(--gold); margin:14px 0 8px;">${note.text}</h3>`;
        } else if (note.type === 'img') {
          notesHTML += `
            <div style="margin:16px 0; border-radius:12px; overflow:hidden; border:1px solid var(--border-dim); background:#080C14;">
              <img src="${note.src}" style="width:100%; height:auto; display:block;" referrerPolicy="no-referrer" />
            </div>
          `;
        } else if (note.type === 'table') {
          notesHTML += `
            <div style="overflow-x:auto; margin:16px 0; border-radius:12px; border:1px solid var(--border-dim);">
              <table style="width:100%; border-collapse:collapse; font-size:12px;">
                <thead>
                  <tr style="background:rgba(232,168,32,0.05); border-bottom:1px solid var(--border-dim);">
          `;
          note.headers.forEach(h => {
            notesHTML += `<th style="padding:10px 12px; text-align:left; font-weight:600; color:var(--gold);">${h}</th>`;
          });
          notesHTML += `</tr></thead><tbody>`;
          note.rows.forEach(row => {
            notesHTML += `<tr style="border-bottom:1px solid rgba(255,255,255,0.03);">`;
            row.forEach(cell => {
              notesHTML += `<td style="padding:10px 12px; color:var(--muted-bright);">${cell}</td>`;
            });
            notesHTML += `</tr>`;
          });
          notesHTML += `</tbody></table></div>`;
        } else if (note.type === 'raw') {
          notesHTML += note.html;
        }
      });
      notesContainer.innerHTML = notesHTML;
    }

    // Render Summary Tab
    const summaryContainer = document.getElementById('stab-summary');
    if (summaryContainer) {
      let sumHTML = '<ul style="padding-left:18px; color:var(--muted-bright); font-size:14px; line-height:1.6;">';
      (content.summary || []).forEach(str => {
        sumHTML += `<li style="margin-bottom:10px; list-style-type:disc;">${str}</li>`;
      });
      sumHTML += '</ul>';
      summaryContainer.innerHTML = sumHTML;
    }

    // Render Traps Tab
    const trapsContainer = document.getElementById('stab-traps');
    if (trapsContainer) {
      let trapsHTML = '<div style="display:flex; flex-direction:column; gap:16px;">';
      
      // Common Traps Group
      trapsHTML += `<div><div style="font-size:11px; font-weight:700; color:var(--gold); letter-spacing:.12em; text-transform:uppercase; margin-bottom:10px;">Common Exam Traps</div><div style="display:flex; flex-direction:column; gap:10px;">`;
      (content.traps || []).forEach(str => {
        trapsHTML += `
          <div style="padding:12px 14px; border-radius:10px; background:rgba(231,76,60,0.05); border:1px solid rgba(231,76,60,0.15); font-size:13px; line-height:1.5; color:#F5B7B1;">
            <strong>Trap:</strong> ${str}
          </div>
        `;
      });
      trapsHTML += `</div></div>`;

      // Common Mistakes Group
      trapsHTML += `<div><div style="font-size:11px; font-weight:700; color:var(--teal); letter-spacing:.12em; text-transform:uppercase; margin-bottom:10px; margin-top:10px;">Common Student Mistakes</div><div style="display:flex; flex-direction:column; gap:10px;">`;
      (content.mistakes || []).forEach(str => {
        trapsHTML += `
          <div style="padding:12px 14px; border-radius:10px; background:rgba(52,152,219,0.05); border:1px solid rgba(52,152,219,0.15); font-size:13px; line-height:1.5; color:#AED6F1;">
            <strong>Mistake:</strong> ${str}
          </div>
        `;
      });
      trapsHTML += `</div></div>`;

      trapsHTML += `</div>`;
      trapsContainer.innerHTML = trapsHTML;
    }

    // Default to the first notes tab
    const tabs = document.querySelectorAll('#screen-subtopic-detail .content-tab');
    if (tabs.length > 0) {
      switchTab(tabs[0], 'stab-notes');
    }

    // Update bookmark save buttons
    updateBookmarkButtonState(code);

    // Active single subtopic test yourself button
    const testStrip = document.getElementById('subtopic-test-strip') || document.createElement('div');
    testStrip.className = "q-footer";
    testStrip.style.padding = "16px 20px";
    testStrip.innerHTML = `
      <button class="next-btn" style="background:var(--gold); color:#080C14; font-weight:700;" onclick="startSubtopicQuiz('${code}')">
        Test Yourself on ${code}
      </button>
    `;

    // Load personal notes for this subtopic
    if (window.loadPersonalNotes) {
      window.loadPersonalNotes(code);
    }

    navTo('screen-subtopic-detail', 'screen-section-detail');
  };

  // Switch tabs (Notes, Summary, Traps)
  window.switchTab = function(element, tabId) {
    if (!element) return;
    
    // Toggle active tab header styles
    const tabs = element.parentElement.children;
    for (let tab of tabs) {
      tab.classList.remove('active');
    }
    element.classList.add('active');

    // Toggle active tab contents
    const bodies = ['stab-notes', 'stab-summary', 'stab-traps'];
    bodies.forEach(id => {
      const container = document.getElementById(id);
      if (container) {
        if (id === tabId) {
          container.style.display = 'block';
        } else {
          container.style.display = 'none';
        }
      }
    });
  };

  // ==========================================
  // 4. BOOKMARK SYSTEM
  // ==========================================
  window.toggleBookmarkCurrent = function() {
    if (!currentSubtopic) return;
    
    const code = currentSubtopic.code;
    const index = bookmarks.indexOf(code);
    if (index === -1) {
      bookmarks.push(code);
    } else {
      bookmarks.splice(index, 1);
    }
    localStorage.setItem('study-bookmarks', JSON.stringify(bookmarks));
    updateBookmarkButtonState(code);
    renderBookmarks();
  };

  function updateBookmarkButtonState(code) {
    const btn = document.getElementById('subtopic-bookmark-btn');
    const icon = document.getElementById('subtopic-bookmark-icon');
    const text = document.getElementById('subtopic-bookmark-text');
    if (!btn || !icon || !text) return;

    const isSaved = bookmarks.includes(code);
    if (isSaved) {
      icon.style.fill = 'var(--gold)';
      icon.style.stroke = 'var(--gold)';
      text.textContent = 'Saved';
      btn.style.background = 'rgba(232,168,32,0.1)';
      btn.style.border = '1px solid var(--gold)';
    } else {
      icon.style.fill = 'none';
      icon.style.stroke = 'currentColor';
      text.textContent = 'Save';
      btn.style.background = 'rgba(255,255,255,0.05)';
      btn.style.border = '1px solid rgba(255,255,255,0.1)';
    }
  }

  // Render lists of bookmarks saved
  function renderBookmarks() {
    const screen = document.getElementById('screen-bookmarks');
    if (!screen) return;

    let container = document.getElementById('bookmarks-list-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'bookmarks-list-container';
      container.style.cssText = "flex:1; overflow-y:auto; padding:12px 20px; z-index:1; position:relative;";
      screen.appendChild(container);
    }

    const stub = screen.querySelector('.stub-screen-body');

    if (bookmarks.length === 0) {
      if (stub) stub.style.display = 'flex';
      container.style.display = 'none';
      return;
    }

    if (stub) stub.style.display = 'none';
    container.style.display = 'block';

    let html = '<div class="subtopic-list" style="display:flex; flex-direction:column; gap:12px;">';
    bookmarks.forEach(code => {
      // Find section details
      const parts = code.split('.');
      const secId = parseInt(parts[0]);
      const sec = sectionsData.find(s => s.id === secId);
      const st = sec ? sec.subtopics.find(x => x.code === code) : null;

      if (st) {
        html += `
          <div class="subtopic-item" onclick="openSubtopicDetail(${secId}, '${code}')">
            <div class="subtopic-info">
              <div class="subtopic-title">${st.title}</div>
              <div class="subtopic-sub">Section ${secId} · ${st.sub}</div>
            </div>
            <div class="subtopic-badge gold">${code}</div>
          </div>
        `;
      }
    });
    html += '</div>';
    container.innerHTML = html;
  }

  // ==========================================
  // PERSONAL NOTES SYSTEM
  // ==========================================
  window.loadPersonalNotes = function(code) {
    const textarea = document.getElementById('personal-notes-textarea');
    const status = document.getElementById('personal-notes-status');
    if (!textarea) return;

    const saved = localStorage.getItem('personal-notes-' + code) || '';
    textarea.value = saved;
    if (status) {
      status.textContent = saved ? 'Saved locally' : 'No notes saved yet';
      status.style.color = 'var(--muted)';
    }
  };

  window.savePersonalNotes = function() {
    if (!currentSubtopic) return;
    const code = currentSubtopic.code;
    const textarea = document.getElementById('personal-notes-textarea');
    const status = document.getElementById('personal-notes-status');
    if (!textarea) return;

    const content = textarea.value;
    localStorage.setItem('personal-notes-' + code, content);
    if (status) {
      status.textContent = content ? 'Auto-saved' : 'No notes saved yet';
      status.style.color = content ? 'var(--gold)' : 'var(--muted)';
    }
  };

  window.clearPersonalNotes = function() {
    if (!currentSubtopic) return;
    if (confirm("Are you sure you want to clear your personal notes for this subtopic?")) {
      const code = currentSubtopic.code;
      const textarea = document.getElementById('personal-notes-textarea');
      const status = document.getElementById('personal-notes-status');
      if (textarea) textarea.value = '';
      localStorage.removeItem('personal-notes-' + code);
      if (status) {
        status.textContent = 'Cleared';
        status.style.color = 'var(--muted)';
      }
    }
  };

  // ==========================================
  // 5. WEAK AREA ANALYZER
  // ==========================================
  function registerWeakArea(code, sectionId) {
    if (!weakAreas.some(w => w.code === code)) {
      const section = sectionsData.find(s => s.id === sectionId);
      const st = section ? section.subtopics.find(x => x.code === code) : null;
      weakAreas.push({
        code: code,
        sectionId: sectionId,
        title: st ? st.title : `Subtopic ${code}`,
        count: 1
      });
    } else {
      const wa = weakAreas.find(w => w.code === code);
      if (wa) wa.count++;
    }
    localStorage.setItem('study-weakareas', JSON.stringify(weakAreas));
    renderWeakAreas();
  }

  function renderWeakAreas() {
    const screen = document.getElementById('screen-weakareas');
    if (!screen) return;

    let container = document.getElementById('weakareas-list-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'weakareas-list-container';
      container.style.cssText = "flex:1; overflow-y:auto; padding:12px 20px; z-index:1; position:relative;";
      screen.appendChild(container);
    }

    const stub = screen.querySelector('.stub-screen-body');

    if (weakAreas.length === 0) {
      if (stub) stub.style.display = 'flex';
      container.style.display = 'none';
      return;
    }

    if (stub) stub.style.display = 'none';
    container.style.display = 'block';

    let html = `
      <div style="font-size:11px; color:var(--muted); margin-bottom:12px;">These subtopics have been flagged because of quiz or exam errors. Read their notes to strengthen understanding.</div>
      <div class="subtopic-list" style="display:flex; flex-direction:column; gap:12px;">
    `;
    weakAreas.forEach(wa => {
      html += `
        <div class="subtopic-item" style="border-left: 3px solid var(--red);" onclick="openSubtopicDetail(${wa.sectionId}, '${wa.code}')">
          <div class="subtopic-info">
            <div class="subtopic-title" style="color:var(--white);">${wa.title}</div>
            <div class="subtopic-sub">Section ${wa.sectionId} · Code ${wa.code}</div>
          </div>
          <div class="subtopic-badge red" style="color:var(--red); background:rgba(231,76,60,0.1); font-size:10px;">Revisit</div>
        </div>
      `;
    });
    html += '</div>';
    container.innerHTML = html;
  }

  // ==========================================
  // 6. VIDEO PLAYBACK GALLERY
  // ==========================================
  function renderVideos() {
    const list = document.getElementById('videos-list');
    if (!list) return;

    let html = '';
    sectionsData.forEach(sec => {
      html += `
        <div class="video-section-item" style="border: 1px solid var(--border-dim); border-radius: 14px; margin: 0 20px 14px; overflow: hidden; background: var(--card); cursor: pointer;" onclick="playSectionVideo(${sec.id})">
          <div class="video-section-header">
            <div class="video-section-thumb" style="width: 44px; height: 44px; border-radius: 10px; background: rgba(232,168,32,0.06); border: 1px solid rgba(232,168,32,0.15); display: flex; align-items: center; justify-content: center;">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:20px; height:20px; stroke:var(--gold);"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
            <div class="video-section-info">
              <div class="video-section-title">${sec.title} Lecture</div>
              <div class="video-section-meta">Section ${sec.id} · NotebookLM Podcast</div>
            </div>
            <div class="video-section-status ready">Ready</div>
          </div>
        </div>
      `;
    });
    list.innerHTML = html;
  }

  window.playSectionVideo = function(sectionId) {
    const sec = sectionsData.find(s => s.id === sectionId);
    if (!sec) return;

    // Load custom biology video IDs or use placeholder
    const videoIDs = {
      1: "fOX_gI9I-O0", // Intro to Microbiology
      2: "X4L3r_y0C8A", // Plant classification
      3: "mRiq6-1Lg_I", // Animal kingdom
      4: "Y0E0tO3n_G8", // Ecological adaptations
      5: "0YyvY_Q-XG0", // Photosynthesis / nutrition
      6: "qSAti2l_Fh0", // Cellular respiration
      7: "tDbaVnI6pE8", // Transport systems
      8: "KsmL_7XGhn8", // Excretion
      9: "gFe4gM93vO8", // Reproduction
      10: "pS90m7I0_X0" // Growth and Development
    };

    const yid = videoIDs[sectionId] || "fOX_gI9I-O0";
    document.getElementById('vp-badge').textContent = `BIO 102 · Section ${sectionId} of 10`;
    document.getElementById('vp-title').textContent = `${sec.title} Lecture`;
    document.getElementById('vp-sub').textContent = sec.sub;
    document.getElementById('vp-title-topbar').textContent = `Section ${sectionId} Video`;

    // Embed YouTube iframe player with loading overlay
    document.getElementById('vp-embed').innerHTML = `
      <div id="video-loading-overlay" style="position:absolute; inset:0; background:#080C14; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; z-index:10; transition:opacity 0.4s ease-out; pointer-events:none;">
        <div class="video-loading-spinner" style="width:36px; height:36px; border:3.5px solid rgba(232,168,32,0.15); border-top-color:var(--gold); border-radius:50%;"></div>
        <div style="font-size:13px; font-weight:600; color:var(--muted-bright); letter-spacing:0.04em; font-family:var(--font-body);">Lecture is loading...</div>
      </div>
      <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${yid}?autoplay=1&rel=0" 
              title="YouTube video player" frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowfullscreen style="display:block; aspect-ratio:16/9; width:100%; border:none;"
              onload="const ov = document.getElementById('video-loading-overlay'); if (ov) { ov.style.opacity = '0'; setTimeout(() => ov.remove(), 400); }"></iframe>
    `;

    // Render key points list
    const points = [
      "In-depth analysis of high-yield questions for the semester exam.",
      "Focuses on practical lab specimens, staining, classifications, and comparative cycles.",
      "Highlights structural diagrams and pathways frequently featured in university assessments."
    ];
    let ptsHTML = '<ul style="padding-left:16px; font-size:13px; line-height:1.6; color:var(--muted-bright);">';
    points.forEach(p => {
      ptsHTML += `<li style="margin-bottom:8px; list-style-type:disc;">${p}</li>`;
    });
    ptsHTML += '</ul>';
    document.getElementById('vp-keypoints').innerHTML = ptsHTML;

    // Test strip inside player
    document.getElementById('vp-test-strip').innerHTML = `
      <button class="next-btn" style="background:var(--gold); color:#080C14; font-weight:700;" onclick="startSectionPractice(${sectionId})">
        Take Practice Quiz for Section ${sectionId}
      </button>
    `;

    navTo('screen-video-player', 'screen-videos');
  };

  // ==========================================
  // 7. QUIZ / EXAM ENGINES
  // ==========================================

  // A. TEST YOURSELF (Subtopic-specific 5 Questions)
  window.startSubtopicQuiz = function(subtopicCode) {
    const parts = subtopicCode.split('.');
    const secId = parseInt(parts[0]);
    const sectionQuestions = getQuestionsForSection(secId);
    
    // Select questions
    tyQuestions = [...sectionQuestions].slice(0, 5);
    tyCurrentIndex = 0;
    tyAnswers = {};
    isTyActive = true;

    showTyQuestion();
    navTo('screen-test-yourself', 'screen-subtopic-detail');
  };

  function showTyQuestion() {
    const q = tyQuestions[tyCurrentIndex];
    if (!q) return;

    document.getElementById('ty-counter').textContent = tyCurrentIndex + 1;
    const prog = document.getElementById('ty-prog');
    if (prog) prog.style.width = `${((tyCurrentIndex + 1) / tyQuestions.length) * 100}%`;

    let html = `
      <div style="font-size:15px; font-weight:600; color:var(--white); margin-bottom:20px; line-height:1.5;">${q.question}</div>
      <div style="display:flex; flex-direction:column; gap:12px;">
    `;
    q.options.forEach((opt, idx) => {
      html += `
        <div class="q-opt" id="ty-opt-${idx}" onclick="selectTyOption(${idx})" style="padding:14px; border:1px solid var(--border-dim); border-radius:12px; cursor:pointer; display:flex; align-items:center; gap:10px; color:var(--muted-bright);">
          <div style="width:24px; height:24px; border-radius:50%; background:rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:var(--gold); border:1px solid rgba(255,255,255,0.1);">${String.fromCharCode(65 + idx)}</div>
          <div style="flex:1; font-size:13.5px;">${opt}</div>
        </div>
      `;
    });
    html += '</div>';

    // Explanation element (hidden initially)
    html += `
      <div id="ty-explanation-box" style="display:none; margin-top:20px; padding:14px; border-radius:12px; background:rgba(26,42,26,0.5); border:1px solid rgba(46,204,113,0.2); color:#B9F5D0; font-size:13px; line-height:1.5;">
        <strong>Explanation:</strong> <span id="ty-explanation-text">${q.explanation}</span>
      </div>
    `;

    document.getElementById('ty-q-body').innerHTML = html;

    const nextBtn = document.getElementById('ty-next-btn');
    if (nextBtn) {
      nextBtn.disabled = true;
      nextBtn.textContent = 'Select an answer';
      nextBtn.style.background = 'rgba(255,255,255,0.05)';
      nextBtn.style.color = 'var(--muted)';
    }
  }

  window.selectTyOption = function(optionIdx) {
    if (tyAnswers[tyCurrentIndex] !== undefined) return; // already answered

    tyAnswers[tyCurrentIndex] = optionIdx;
    const q = tyQuestions[tyCurrentIndex];
    const isCorrect = optionIdx === q.answer;

    // Update option card styling
    const selectedOpt = document.getElementById(`ty-opt-${optionIdx}`);
    const correctOpt = document.getElementById(`ty-opt-${q.answer}`);

    if (isCorrect) {
      selectedOpt.classList.add('correct');
      selectedOpt.style.borderColor = 'var(--green)';
      selectedOpt.style.background = 'var(--green-dim)';
      selectedOpt.style.color = '#B9F5D0';
    } else {
      selectedOpt.style.borderColor = 'var(--red)';
      selectedOpt.style.background = 'rgba(231,76,60,0.08)';
      selectedOpt.style.color = '#F5B7B1';

      correctOpt.classList.add('correct');
      correctOpt.style.borderColor = 'var(--green)';
      correctOpt.style.background = 'var(--green-dim)';
      correctOpt.style.color = '#B9F5D0';

      // Register error in weak area diagnostics
      if (currentSubtopic) {
        registerWeakArea(currentSubtopic.code, currentSection.id);
      }
    }

    // Show explanation
    const expBox = document.getElementById('ty-explanation-box');
    if (expBox) expBox.style.display = 'block';

    const nextBtn = document.getElementById('ty-next-btn');
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.textContent = tyCurrentIndex === tyQuestions.length - 1 ? 'Show Results' : 'Proceed →';
      nextBtn.style.background = 'var(--gold)';
      nextBtn.style.color = '#080C14';
    }
  }

  window.tyNextQuestion = function() {
    if (tyCurrentIndex < tyQuestions.length - 1) {
      tyCurrentIndex++;
      showTyQuestion();
    } else {
      // Show results
      finishQuizSession(tyQuestions, tyAnswers, 'Subtopic Quiz');
    }
  };

  // B. PRACTICE (Section-level 10 Questions)
  window.startSectionPractice = function(sectionId) {
    const questions = getQuestionsForSection(sectionId);
    practiceQuestions = [...questions];
    practiceCurrentIndex = 0;
    practiceAnswers = {};
    isPracticeActive = true;

    showPracticeQuestion();
    navTo('screen-practice-q', 'screen-section-detail');
  };

  function showPracticeQuestion() {
    const q = practiceQuestions[practiceCurrentIndex];
    if (!q) return;

    const counter = document.getElementById('pq-counter-el');
    if (counter) counter.textContent = practiceCurrentIndex + 1;
    const prog = document.getElementById('pq-prog');
    if (prog) prog.style.width = `${((practiceCurrentIndex + 1) / practiceQuestions.length) * 100}%`;

    let html = `
      <div style="font-size:15px; font-weight:600; color:var(--white); margin-bottom:20px; line-height:1.5;">${q.question}</div>
      <div style="display:flex; flex-direction:column; gap:12px;">
    `;
    q.options.forEach((opt, idx) => {
      html += `
        <div class="q-opt" id="pq-opt-${idx}" onclick="selectPracticeOption(${idx})" style="padding:14px; border:1px solid var(--border-dim); border-radius:12px; cursor:pointer; display:flex; align-items:center; gap:10px; color:var(--muted-bright);">
          <div style="width:24px; height:24px; border-radius:50%; background:rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:var(--gold); border:1px solid rgba(255,255,255,0.1);">${String.fromCharCode(65 + idx)}</div>
          <div style="flex:1; font-size:13.5px;">${opt}</div>
        </div>
      `;
    });
    html += '</div>';

    // Explanation
    html += `
      <div id="pq-explanation-box" style="display:none; margin-top:20px; padding:14px; border-radius:12px; background:rgba(26,42,26,0.5); border:1px solid rgba(46,204,113,0.2); color:#B9F5D0; font-size:13px; line-height:1.5;">
        <strong>Explanation:</strong> <span>${q.explanation}</span>
      </div>
    `;

    document.getElementById('practice-q-body').innerHTML = html;

    const nextBtn = document.getElementById('pq-next-btn');
    if (nextBtn) {
      nextBtn.disabled = true;
      nextBtn.textContent = 'Select an answer';
      nextBtn.style.background = 'rgba(255,255,255,0.05)';
      nextBtn.style.color = 'var(--muted)';
    }
  }

  window.selectPracticeOption = function(optionIdx) {
    if (practiceAnswers[practiceCurrentIndex] !== undefined) return;

    practiceAnswers[practiceCurrentIndex] = optionIdx;
    const q = practiceQuestions[practiceCurrentIndex];
    const isCorrect = optionIdx === q.answer;

    const selectedOpt = document.getElementById(`pq-opt-${optionIdx}`);
    const correctOpt = document.getElementById(`pq-opt-${q.answer}`);

    if (isCorrect) {
      selectedOpt.classList.add('correct');
      selectedOpt.style.borderColor = 'var(--green)';
      selectedOpt.style.background = 'var(--green-dim)';
      selectedOpt.style.color = '#B9F5D0';
    } else {
      selectedOpt.style.borderColor = 'var(--red)';
      selectedOpt.style.background = 'rgba(231,76,60,0.08)';
      selectedOpt.style.color = '#F5B7B1';

      correctOpt.classList.add('correct');
      correctOpt.style.borderColor = 'var(--green)';
      correctOpt.style.background = 'var(--green-dim)';
      correctOpt.style.color = '#B9F5D0';

      // Register error
      if (currentSection) {
        // use fallback subtopic code or similar
        const subtopicCode = `${currentSection.id}.1`;
        registerWeakArea(subtopicCode, currentSection.id);
      }
    }

    // Show explanation
    const expBox = document.getElementById('pq-explanation-box');
    if (expBox) expBox.style.display = 'block';

    const nextBtn = document.getElementById('pq-next-btn');
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.textContent = practiceCurrentIndex === practiceQuestions.length - 1 ? 'Show Results' : 'Proceed →';
      nextBtn.style.background = 'var(--gold)';
      nextBtn.style.color = '#080C14';
    }
  }

  window.pqNextQuestion = function() {
    if (practiceCurrentIndex < practiceQuestions.length - 1) {
      practiceCurrentIndex++;
      showPracticeQuestion();
    } else {
      finishQuizSession(practiceQuestions, practiceAnswers, 'Practice Session');
    }
  };

  // C. FULL CBT EXAM SYSTEM
  window.submitCBTSetup = function() {
    // Generate examination questions from all sections
    cbtQuestions = [];
    sectionsData.forEach(sec => {
      const qs = getQuestionsForSection(sec.id);
      if (qs && qs.length > 0) {
        cbtQuestions.push({ ...qs[0], sectionId: sec.id }); // select high probability question
      }
    });

    cbtCurrentIndex = 0;
    cbtAnswers = {};
    cbtTimeLeft = 45 * 60; // 45 minutes

    // Start Timer Interval
    clearInterval(cbtTimerInterval);
    cbtTimerInterval = setInterval(updateCBTClock, 1000);

    // Save exam start logs
    localStorage.setItem('cbt-candidate-name', document.getElementById('cbt-input-name').value || userProfile.name);
    localStorage.setItem('cbt-candidate-reg', document.getElementById('cbt-input-reg').value || "REG-2026-BIO102");

    showCBTQuestion();
    navTo('screen-cbt', 'screen-cbt-setup');
  };

  function updateCBTClock() {
    if (cbtTimeLeft > 0) {
      cbtTimeLeft--;
      const min = Math.floor(cbtTimeLeft / 60);
      const sec = cbtTimeLeft % 60;
      document.getElementById('cbt-timer').textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    } else {
      // Times up! Force submit
      clearInterval(cbtTimerInterval);
      submitCBTExam();
    }
  }

  function showCBTQuestion() {
    const q = cbtQuestions[cbtCurrentIndex];
    if (!q) return;

    // Update progress
    document.getElementById('cbt-prog').style.width = `${((cbtCurrentIndex + 1) / cbtQuestions.length) * 100}%`;

    let html = `
      <div style="font-size:12px; font-weight:700; color:var(--gold); letter-spacing:.1em; text-transform:uppercase; margin-bottom:8px;">Section ${q.sectionId} Question</div>
      <div style="font-size:15px; font-weight:600; color:var(--white); margin-bottom:20px; line-height:1.5;">${q.question}</div>
      <div style="display:flex; flex-direction:column; gap:12px;">
    `;
    q.options.forEach((opt, idx) => {
      const isSelected = cbtAnswers[cbtCurrentIndex] === idx;
      const selectClass = isSelected ? 'style="border-color: var(--gold); background: rgba(232,168,32,0.08);"' : '';
      html += `
        <div class="q-opt" onclick="selectCBTOption(${idx})" ${selectClass} style="padding:14px; border:1px solid var(--border-dim); border-radius:12px; cursor:pointer; display:flex; align-items:center; gap:10px; color:var(--muted-bright);">
          <div style="width:24px; height:24px; border-radius:50%; background:rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:var(--gold); border:1px solid rgba(255,255,255,0.1);">${String.fromCharCode(65 + idx)}</div>
          <div style="flex:1; font-size:13.5px;">${opt}</div>
        </div>
      `;
    });
    html += '</div>';

    document.getElementById('cbt-q-body').innerHTML = html;

    // Update control button labels
    const nextBtn = document.getElementById('cbt-next-btn');
    if (cbtCurrentIndex === cbtQuestions.length - 1) {
      nextBtn.textContent = 'Submit Exam ➔';
      nextBtn.style.background = 'var(--gold)';
    } else {
      nextBtn.textContent = 'Save & Proceed →';
      nextBtn.style.background = 'var(--gold)';
    }
  }

  window.selectCBTOption = function(optionIdx) {
    cbtAnswers[cbtCurrentIndex] = optionIdx;
    showCBTQuestion();
  };

  window.cbtPrev = function() {
    if (cbtCurrentIndex > 0) {
      cbtCurrentIndex--;
      showCBTQuestion();
    }
  };

  window.cbtNext = function() {
    if (cbtCurrentIndex < cbtQuestions.length - 1) {
      cbtCurrentIndex++;
      showCBTQuestion();
    } else {
      // Final submit confirmation
      if (confirm("Are you sure you want to completely submit your CBT exam session?")) {
        submitCBTExam();
      }
    }
  };

  function submitCBTExam() {
    clearInterval(cbtTimerInterval);
    
    // Evaluate scores
    let correctCount = 0;
    cbtQuestions.forEach((q, idx) => {
      if (cbtAnswers[idx] === q.answer) {
        correctCount++;
      } else {
        // Register errors in weak areas
        registerWeakArea(`${q.sectionId}.1`, q.sectionId);
      }
    });

    const total = cbtQuestions.length;
    const scorePct = Math.round((correctCount / total) * 100);

    // Save CBT history stats
    localStorage.setItem('study-last-cbt-score', scorePct);
    localStorage.setItem('study-last-cbt-correct', correctCount);
    localStorage.setItem('study-last-cbt-total', total);

    // Populate results page
    document.getElementById('result-score-display').textContent = `${scorePct}%`;
    document.getElementById('res-correct').textContent = correctCount;
    document.getElementById('res-wrong').textContent = total - correctCount;
    document.getElementById('res-total').textContent = total;
    document.getElementById('result-message').textContent = `Candidate: ${localStorage.getItem('cbt-candidate-name')} (${localStorage.getItem('cbt-candidate-reg')}). You scored ${correctCount} out of ${total} questions.`;

    navTo('screen-result', 'screen-cbt');
  }

  window.exitCBT = function() {
    if (confirm("Quit active exam portal? Progress will be lost.")) {
      clearInterval(cbtTimerInterval);
      navTo('screen-home', 'screen-cbt');
    }
  };

  // Matrix navigation modal rendering
  window.openMatrix = function() {
    const modal = document.getElementById('cbt-matrix-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.style.display = 'flex';

    // Set matrix identity
    document.getElementById('matrix-name').textContent = localStorage.getItem('cbt-candidate-name') || userProfile.name;
    document.getElementById('matrix-reg').textContent = localStorage.getItem('cbt-candidate-reg') || "CANDIDATE-01";
    document.getElementById('matrix-avatar').textContent = (localStorage.getItem('cbt-candidate-name') || userProfile.name).charAt(0).toUpperCase();

    // Render navigation numbers
    const grid = document.getElementById('matrix-grid');
    let html = '';
    let answeredCount = 0;
    cbtQuestions.forEach((q, idx) => {
      const isAnswered = cbtAnswers[idx] !== undefined;
      const isActive = idx === cbtCurrentIndex;
      if (isAnswered) answeredCount++;

      const activeClass = isActive ? 'active' : '';
      const answeredClass = isAnswered ? 'answered' : '';

      html += `<div class="matrix-btn ${activeClass} ${answeredClass}" onclick="goToCBTQuestion(${idx})">${idx + 1}</div>`;
    });
    grid.innerHTML = html;

    document.getElementById('matrix-answered-count').textContent = `${answeredCount} of ${cbtQuestions.length} Answered`;
  };

  window.closeMatrix = function() {
    const modal = document.getElementById('cbt-matrix-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  };

  window.goToCBTQuestion = function(idx) {
    cbtCurrentIndex = idx;
    showCBTQuestion();
    closeMatrix();
  };

  // Shared completion panel for practice / single subtopic quiz
  function finishQuizSession(questionsList, answersMap, typeLabel) {
    let correctCount = 0;
    questionsList.forEach((q, idx) => {
      if (answersMap[idx] === q.answer) {
        correctCount++;
      }
    });

    const total = questionsList.length;
    const scorePct = Math.round((correctCount / total) * 100);

    // Save session stats
    localStorage.setItem(`last-${typeLabel}-score`, scorePct);

    // Pop results
    document.getElementById('result-score-display').textContent = `${scorePct}%`;
    document.getElementById('res-correct').textContent = correctCount;
    document.getElementById('res-wrong').textContent = total - correctCount;
    document.getElementById('res-total').textContent = total;
    document.getElementById('result-message').textContent = `Completed ${typeLabel}! Accuracy of ${correctCount} correct out of ${total} total questions.`;

    // Handle back stack navigation cleanly
    navTo('screen-result', '');
  }

  // ==========================================
  // 8. PRACTICE STUDY REPORT GENERATOR (PDF Simulation)
  // ==========================================
  window.downloadStudyReport = function() {
    // Generate text/plain beautiful progress card
    const name = localStorage.getItem('profile-name') || userProfile.name;
    const dept = localStorage.getItem('profile-dept') || userProfile.dept;
    const uni = localStorage.getItem('profile-uni') || userProfile.uni;

    // Calculate syllabus progress
    let totalSubtopics = 0;
    let readSubtopics = 0;
    sectionsData.forEach(s => {
      s.subtopics.forEach(st => {
        totalSubtopics++;
        if (localStorage.getItem(`read-${st.code}`)) readSubtopics++;
      });
    });
    const progressPct = Math.round((readSubtopics / totalSubtopics) * 100);

    const reportContent = `
===================================================================
                  ZENITH EMPIRE - ACADEMIC STUDY REPORT
===================================================================
Date Generated: ${new Date().toLocaleString()}
Student Candidate Name: ${name}
Department / Field: ${dept}
University / Institution: ${uni}
-------------------------------------------------------------------

1. SYLLABUS READING PROGRESS STATUS:
--------------------------------------------------
Total Syllabus Sections: 10
Syllabus Read Coverage: ${progressPct}% (${readSubtopics} of ${totalSubtopics} Subtopics completed)
Last Studied Subtopic: ${currentSubtopic ? currentSubtopic.title : 'None selected yet'}

2. COMPUTER-BASED TEST (CBT) HISTORIC HIGHLIGHTS:
--------------------------------------------------
Latest Exam Simulation Score: ${localStorage.getItem('study-last-cbt-score') || '—'}%
Correct Answers: ${localStorage.getItem('study-last-cbt-correct') || '—'} / ${localStorage.getItem('study-last-cbt-total') || '—'} questions

3. SAVE BOOKMARKS STATS:
--------------------------------------------------
Total Bookmarked Readings: ${bookmarks.length}

4. DIAGNOSTIC WEAK AREA CRITICAL HIGHLIGHTS:
--------------------------------------------------
${weakAreas.length === 0 ? '✓ Excellent work! No major weak topics logged.' : 'Revisit these flagged weak topics to strengthen understanding:'}
${weakAreas.map((w, idx) => `${idx + 1}. [Section ${w.sectionId}] - Code ${w.code}: ${w.title}`).join('\n')}

===================================================================
              "Success is the sum of small efforts"
===================================================================
`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BIO102_Academic_Study_Report_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ==========================================
  // 9. PROFILE MANAGEMENT
  // ==========================================
  window.openProfile = function() {
    // Fill values
    document.getElementById('profile-input-name').value = userProfile.name;
    document.getElementById('profile-input-age').value = userProfile.age;
    document.getElementById('profile-input-dept').value = userProfile.dept;
    document.getElementById('profile-input-uni').value = userProfile.uni;

    navTo('screen-profile', 'screen-home');
  };

  window.saveProfile = function() {
    userProfile.name = document.getElementById('profile-input-name').value || "Victor Okafor";
    userProfile.age = document.getElementById('profile-input-age').value || "19";
    userProfile.dept = document.getElementById('profile-input-dept').value || "Medical Laboratory Science";
    userProfile.uni = document.getElementById('profile-input-uni').value || "FUAHSE";

    localStorage.setItem('study-profile', JSON.stringify(userProfile));
    
    // Update display greetings
    updateProfileUI();
    goBack();
  };

  function updateProfileUI() {
    const displays = {
      'profile-name-display': userProfile.name,
      'profile-dept-display': userProfile.dept,
      'matrix-name': userProfile.name
    };

    for (let id in displays) {
      const el = document.getElementById(id);
      if (el) el.textContent = displays[id];
    }

    const homeGreeting = document.querySelector('.greeting-name');
    if (homeGreeting) homeGreeting.textContent = userProfile.name;

    const avatars = document.querySelectorAll('.avatar, .matrix-student-avatar');
    avatars.forEach(av => {
      av.textContent = userProfile.name.charAt(0).toUpperCase();
    });
  }

  // ==========================================
  // 10. SCIENTIFIC CALCULATOR ENGINE
  // ==========================================
  let calcExpr = '';

  window.openCalc = function() {
    const modal = document.getElementById('cbt-calc-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
    }
  };

  window.closeCalc = function() {
    const modal = document.getElementById('cbt-calc-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  };

  window.calcInput = function(val) {
    calcExpr += val;
    document.getElementById('calc-display').textContent = calcExpr;
  };

  window.calcClear = function() {
    calcExpr = '';
    document.getElementById('calc-display').textContent = '0';
  };

  window.calcDel = function() {
    calcExpr = calcExpr.slice(0, -1);
    document.getElementById('calc-display').textContent = calcExpr || '0';
  };

  window.calcEquals = function() {
    try {
      // Safe execution using math library simulation or basic safe js eval
      let sanitized = calcExpr.replace(/[^0-9+\-*/().]/g, '');
      let result = Function(`"use strict"; return (${sanitized})`)();
      calcExpr = result.toString();
      document.getElementById('calc-display').textContent = calcExpr;
    } catch (e) {
      document.getElementById('calc-display').textContent = 'Error';
      calcExpr = '';
    }
  };

  // ==========================================
  // 11. NAVIGATION CONTROL PANEL
  // ==========================================
  window.navTo = function(target, source) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active');
    });

    const targetEl = document.getElementById(target);
    if (targetEl) {
      targetEl.classList.add('active');
    }

    // Push state tracking
    if (navHistory[navHistory.length - 1] !== target) {
      navHistory.push(target);
    }

    // Lazy load specific rendering triggers
    if (target === 'screen-bookmarks') {
      renderBookmarks();
    } else if (target === 'screen-weakareas') {
      renderWeakAreas();
    } else if (target === 'screen-videos') {
      renderVideos();
    }
  };

  window.goBack = function() {
    if (navHistory.length > 1) {
      navHistory.pop(); // remove current
      const prevScreen = navHistory[navHistory.length - 1];
      
      document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
      });

      const prevEl = document.getElementById(prevScreen);
      if (prevEl) {
        prevEl.classList.add('active');
      }

      // Refresh list elements if needed
      if (prevScreen === 'screen-bookmarks') {
        renderBookmarks();
      } else if (prevScreen === 'screen-weakareas') {
        renderWeakAreas();
      }
    } else {
      // Default fallback
      navTo('screen-home', '');
    }
  };

  // Boot Setup Hook
  document.addEventListener('DOMContentLoaded', function() {
    updateProfileUI();
    renderSections();
  });

})();
// Append to app.js
(function() {
  // Practice Setup Logic
  window.startPracticeFromSetup = function() {
    const sectionChip = document.querySelector('#practice-section-chips .chip.selected');
    const topic = sectionChip ? sectionChip.getAttribute('data-topic') : 'all';
    
    let qs = [];
    if (topic === 'all') {
      sectionsData.forEach(s => qs = qs.concat(getQuestionsForSection(s.id)));
    } else {
      qs = getQuestionsForSection(parseInt(topic));
    }
    
    qs.sort(() => 0.5 - Math.random());
    pqQuestions = qs.slice(0, 10);
    if(pqQuestions.length === 0) {
      alert("No questions found for this selection.");
      return;
    }
    pqCurrentIndex = 0;
    pqAnswers = {};
    isPqActive = true;
    showPqQuestion();
    navTo('screen-practice-q', 'screen-practice-setup');
  };

  let pqQuestions = [];
  let pqCurrentIndex = 0;
  let pqAnswers = {};
  let isPqActive = false;

  function showPqQuestion() {
    const q = pqQuestions[pqCurrentIndex];
    if (!q) return;
    document.getElementById('pq-counter-el').textContent = pqCurrentIndex + 1;
    const prog = document.getElementById('pq-prog');
    if (prog) prog.style.width = `${((pqCurrentIndex + 1) / pqQuestions.length) * 100}%`;
    
    let html = `<div style="font-size:15px; font-weight:600; color:var(--white); margin-bottom:20px; line-height:1.5;">${q.question}</div>
      <div style="display:flex; flex-direction:column; gap:12px;">`;
    
    q.options.forEach((opt, idx) => {
      html += `
        <div class="q-opt" id="pq-opt-${idx}" onclick="selectPqOption(${idx})" style="padding:14px; border:1px solid var(--border-dim); border-radius:12px; cursor:pointer; display:flex; align-items:center; gap:10px; color:var(--muted-bright);">
          <div style="width:24px; height:24px; border-radius:50%; background:rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:var(--gold); border:1px solid rgba(255,255,255,0.1);">${String.fromCharCode(65 + idx)}</div>
          <div style="flex:1; font-size:13.5px;">${opt}</div>
        </div>`;
    });
    html += '</div>';
    
    html += `
      <div id="pq-explanation-box" style="display:none; margin-top:20px; padding:14px; border-radius:12px; background:rgba(26,42,26,0.5); border:1px solid rgba(46,204,113,0.2); color:#B9F5D0; font-size:13px; line-height:1.5;">
        <strong>Explanation:</strong> <span id="pq-explanation-text">${q.explanation}</span>
      </div>`;
      
    document.getElementById('practice-q-body').innerHTML = html;
    const nextBtn = document.getElementById('pq-next-btn');
    if (nextBtn) {
      nextBtn.disabled = true;
      nextBtn.textContent = 'Select an answer';
      nextBtn.style.background = 'rgba(255,255,255,0.05)';
      nextBtn.style.color = 'var(--muted)';
    }
  }

  window.selectPqOption = function(optionIdx) {
    if (pqAnswers[pqCurrentIndex] !== undefined) return;
    pqAnswers[pqCurrentIndex] = optionIdx;
    const q = pqQuestions[pqCurrentIndex];
    
    const selectedEl = document.getElementById(`pq-opt-${optionIdx}`);
    const correctEl = document.getElementById(`pq-opt-${q.answer}`);
    
    if (optionIdx === q.answer) {
      selectedEl.style.borderColor = 'var(--gold)';
      selectedEl.style.background = 'rgba(212,175,55,0.1)';
      selectedEl.style.color = 'var(--white)';
    } else {
      selectedEl.style.borderColor = '#e74c3c';
      selectedEl.style.background = 'rgba(231,76,60,0.1)';
      selectedEl.style.color = 'var(--white)';
      if (correctEl) {
        correctEl.style.borderColor = 'var(--gold)';
        correctEl.style.background = 'rgba(212,175,55,0.1)';
        correctEl.style.color = 'var(--white)';
      }
      
      if(!weakAreas.some(w => w.code === q.code)) {
        weakAreas.push({ sectionId: q.sectionId, code: q.code, title: `Subtopic ${q.code}` });
        localStorage.setItem('weakAreas', JSON.stringify(weakAreas));
      }
    }
    
    const expBox = document.getElementById('pq-explanation-box');
    if (expBox) expBox.style.display = 'block';
    
    const nextBtn = document.getElementById('pq-next-btn');
    nextBtn.disabled = false;
    if (pqCurrentIndex === pqQuestions.length - 1) {
      nextBtn.textContent = 'Finish Practice ➔';
    } else {
      nextBtn.textContent = 'Next Question →';
    }
    nextBtn.style.background = 'var(--gold)';
    nextBtn.style.color = '#1a1200';
  };

  window.pqNextQuestion = function() {
    if (pqAnswers[pqCurrentIndex] === undefined) return;
    if (pqCurrentIndex < pqQuestions.length - 1) {
      pqCurrentIndex++;
      showPqQuestion();
    } else {
      finishQuizSession(pqQuestions, pqAnswers, 'Practice Session');
      navTo('screen-result', 'screen-practice-q');
      isPqActive = false;
    }
  };

  let pqiQuestions = [];
  let pqiCurrentIndex = 0;
  let pqiAnswers = {};
  let pqiCurrentSectionId = 1;

  window.pqiOpen = function() {
    const listEl = document.getElementById('pqi-section-list');
    let html = '';
    sectionsData.forEach(s => {
      html += `
        <div style="background:var(--card);border:1px solid var(--border-dim);border-radius:14px;padding:16px;margin-bottom:12px;cursor:pointer;display:flex;align-items:center;" onclick="startPQI(${s.id})">
          <div style="width:40px;height:40px;border-radius:50%;background:rgba(212,175,55,0.1);color:var(--gold);display:flex;align-items:center;justify-content:center;font-weight:700;margin-right:14px;font-size:16px;">S${s.id}</div>
          <div style="flex:1;">
            <div style="font-size:15px;font-weight:600;color:var(--white);margin-bottom:2px;">${s.title}</div>
            <div style="font-size:12px;color:var(--muted-bright);">17 Questions</div>
          </div>
          <div style="color:var(--gold);">→</div>
        </div>
      `;
    });
    listEl.innerHTML = html;
    
    document.getElementById('pqi-select-state').style.display = 'flex';
    document.getElementById('pqi-quiz-state').style.display = 'none';
    navTo('screen-pastq', 'screen-exam');
  };

  window.startPQI = function(sectionId) {
    pqiCurrentSectionId = sectionId;
    pqiQuestions = getQuestionsForSection(sectionId).slice(0, 17);
    if(pqiQuestions.length === 0) {
      alert("No questions found for this section.");
      return;
    }
    pqiCurrentIndex = 0;
    pqiAnswers = {};
    
    document.getElementById('pqi-select-state').style.display = 'none';
    document.getElementById('pqi-quiz-state').style.display = 'flex';
    document.getElementById('pqi-results').style.display = 'none';
    document.getElementById('pqi-next-btn').style.display = 'block';
    document.getElementById('pqi-opts').style.display = 'block';
    document.getElementById('pqi-q-text').style.display = 'block';
    document.getElementById('pqi-q-label').style.display = 'block';
    
    document.getElementById('pqi-topbar-title').textContent = `Section ${sectionId} Intel`;
    
    showPQIQuestion();
  };

  function showPQIQuestion() {
    const q = pqiQuestions[pqiCurrentIndex];
    if (!q) return;
    
    document.getElementById('pqi-progress-label').textContent = `${pqiCurrentIndex + 1}/${pqiQuestions.length}`;
    document.getElementById('pqi-q-label').textContent = `Question ${pqiCurrentIndex + 1} of ${pqiQuestions.length}`;
    document.getElementById('pqi-q-text').textContent = q.question;
    
    let dotsHtml = '';
    pqiQuestions.forEach((_, idx) => {
      let color = 'rgba(255,255,255,0.1)';
      if (pqiAnswers[idx] !== undefined) {
        color = pqiAnswers[idx] === pqiQuestions[idx].answer ? '#2ecc71' : '#e74c3c';
      } else if (idx === pqiCurrentIndex) {
        color = 'var(--gold)';
      }
      dotsHtml += `<div style="width:8px;height:8px;border-radius:50%;background:${color};"></div>`;
    });
    document.getElementById('pqi-dots').innerHTML = dotsHtml;
    
    let c = 0, w = 0;
    Object.keys(pqiAnswers).forEach(idx => {
      if (pqiAnswers[idx] === pqiQuestions[idx].answer) c++;
      else w++;
    });
    document.getElementById('pqi-score-correct').textContent = c;
    document.getElementById('pqi-score-wrong').textContent = w;
    document.getElementById('pqi-score-remain').textContent = `${pqiQuestions.length - Object.keys(pqiAnswers).length} left`;
    
    let html = '';
    q.options.forEach((opt, idx) => {
      html += `
        <div class="q-opt" id="pqi-opt-${idx}" onclick="selectPQIOption(${idx})" style="padding:14px; border:1px solid var(--border-dim); border-radius:12px; cursor:pointer; display:flex; align-items:center; gap:10px; color:var(--muted-bright); margin-bottom:12px;">
          <div style="width:24px; height:24px; border-radius:50%; background:rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:var(--gold); border:1px solid rgba(255,255,255,0.1);">${String.fromCharCode(65 + idx)}</div>
          <div style="flex:1; font-size:13.5px;">${opt}</div>
        </div>`;
    });
    document.getElementById('pqi-opts').innerHTML = html;
    
    document.getElementById('pqi-exp-box').style.display = 'none';
    const nextBtn = document.getElementById('pqi-next-btn');
    nextBtn.disabled = true;
    nextBtn.style.opacity = '0.5';
  }

  window.selectPQIOption = function(optionIdx) {
    if (pqiAnswers[pqiCurrentIndex] !== undefined) return;
    pqiAnswers[pqiCurrentIndex] = optionIdx;
    const q = pqiQuestions[pqiCurrentIndex];
    
    const selectedEl = document.getElementById(`pqi-opt-${optionIdx}`);
    const correctEl = document.getElementById(`pqi-opt-${q.answer}`);
    
    if (optionIdx === q.answer) {
      selectedEl.style.borderColor = '#2ecc71';
      selectedEl.style.background = 'rgba(46,204,113,0.1)';
      selectedEl.style.color = 'var(--white)';
    } else {
      selectedEl.style.borderColor = '#e74c3c';
      selectedEl.style.background = 'rgba(231,76,60,0.1)';
      selectedEl.style.color = 'var(--white)';
      if (correctEl) {
        correctEl.style.borderColor = '#2ecc71';
        correctEl.style.background = 'rgba(46,204,113,0.1)';
        correctEl.style.color = 'var(--white)';
      }
    }
    
    document.getElementById('pqi-exp-text').textContent = q.explanation || 'No further explanation.';
    document.getElementById('pqi-exp-box').style.display = 'block';
    
    const nextBtn = document.getElementById('pqi-next-btn');
    nextBtn.disabled = false;
    nextBtn.style.opacity = '1';
    if (pqiCurrentIndex === pqiQuestions.length - 1) {
      nextBtn.textContent = 'View Results ➔';
    } else {
      nextBtn.textContent = 'Next Question →';
    }
  };

  window.pqiNext = function() {
    if (pqiAnswers[pqiCurrentIndex] === undefined) return;
    if (pqiCurrentIndex < pqiQuestions.length - 1) {
      pqiCurrentIndex++;
      showPQIQuestion();
    } else {
      document.getElementById('pqi-q-text').style.display = 'none';
      document.getElementById('pqi-q-label').style.display = 'none';
      document.getElementById('pqi-opts').style.display = 'none';
      document.getElementById('pqi-exp-box').style.display = 'none';
      document.getElementById('pqi-next-btn').style.display = 'none';
      
      let c = 0;
      Object.keys(pqiAnswers).forEach(idx => {
        if (pqiAnswers[idx] === pqiQuestions[idx].answer) c++;
      });
      const pct = Math.round((c / pqiQuestions.length) * 100);
      
      document.getElementById('pqi-result-score').textContent = `${pct}% Correct`;
      document.getElementById('pqi-result-msg').textContent = `You got ${c} out of ${pqiQuestions.length} questions right.`;
      document.getElementById('pqi-result-emoji').textContent = pct >= 70 ? '🏆' : '📚';
      document.getElementById('pqi-results').style.display = 'block';
    }
  };

  window.pqiExitQuiz = function() {
    document.getElementById('pqi-quiz-state').style.display = 'none';
    document.getElementById('pqi-select-state').style.display = 'flex';
  };

  window.pqiRestart = function() {
    startPQI(pqiCurrentSectionId);
  };

  window.toggleReminder = function() {
    const el = document.getElementById('reminder-toggle');
    if (el) {
      if (el.classList.contains('on')) {
        el.classList.remove('on');
        localStorage.setItem('reminder-enabled', 'false');
      } else {
        el.classList.add('on');
        localStorage.setItem('reminder-enabled', 'true');
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.setup-chips .chip').forEach(chip => {
      chip.addEventListener('click', function() {
        const container = this.closest('.setup-chips');
        container.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
      });
    });
  });

})();
