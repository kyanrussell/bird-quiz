import React, { useState } from "react";

const BirdQuiz = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(""); // To store feedback after each guess
  const [species1, setSpecies1] = useState(""); // Species for the first textbox
  const [species2, setSpecies2] = useState(""); // Species for the second textbox
  const [numQuestions, setNumQuestions] = useState(5); // Default number of questions
  const [startQuiz, setStartQuiz] = useState(false); // To check if quiz has started

  // Fetch bird images based on user input
  const fetchBirdImages = async () => {
    const fetchedImages = [];

    // Array to store both species
    const speciesArray = [species1, species2];

    // Number of questions to fetch (based on the user input)
    const questionsToFetch = Math.min(numQuestions, 10); // Fetch up to 10 images per species

    for (let i = 0; i < speciesArray.length; i++) {
      const speciesName = speciesArray[i];
      const query = `${encodeURIComponent(speciesName)} bird photograph`; // Append "bird photograph" to the search query
      const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&gsrlimit=${questionsToFetch}&prop=imageinfo&iiprop=url&gsrnamespace=6&format=json&origin=*`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.query && data.query.pages) {
          const images = Object.values(data.query.pages).map((page) => ({
            title: page.title,
            url: page.imageinfo[0]?.url || "", // Handle missing URL
            species: speciesName
          }));

          fetchedImages.push(...images);
        }
      } catch (error) {
        console.error("Error fetching bird images:", error);
      }
    }

    // Randomize the order of the images and limit the total number of questions
    setImages(shuffleArray(fetchedImages).slice(0, questionsToFetch));
    setLoading(false);
  };

  // Shuffle function to randomize the array of images
  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const handleGuess = (guess) => {
    const correctSpecies = images[currentIndex].species;

    // Check if the guess is correct
    if (correctSpecies === guess) {
      setScore((prev) => prev + 1);
      setFeedback("Correct!");
    } else {
      setFeedback(`Incorrect. The correct answer was ${correctSpecies}.`);
    }

    // Move to the next image
    setCurrentIndex((prev) => prev + 1);
  };

  const handleStartQuiz = () => {
    if (species1 && species2) {
      setStartQuiz(true);
      fetchBirdImages(); // Start fetching images after the species are set
    } else {
      alert("Please enter both bird species to start the quiz.");
    }
  };

  const handleRestartQuiz = (option) => {
    if (option === "newSpecies") {
      // Reset the state for new species input
      setScore(0);
      setCurrentIndex(0);
      setLoading(true);
      setFeedback("");
      setSpecies1("");
      setSpecies2("");
      setStartQuiz(false);
    } else if (option === "sameSpecies") {
      // Fetch new images with the same species
      setScore(0);
      setCurrentIndex(0);
      setLoading(true);
      setFeedback("");
      fetchBirdImages(); // Re-fetch images for the same species
    }
  };

  return (
    <div>
      <h1>Bird Quiz</h1>
      {!startQuiz ? (
        <div>
          <div>
            <label htmlFor="species1">Enter the first bird species:</label>
            <input
              id="species1"
              type="text"
              value={species1}
              onChange={(e) => setSpecies1(e.target.value)}
              placeholder="e.g. Arctic Tern"
            />
          </div>
          <div>
            <label htmlFor="species2">Enter the second bird species:</label>
            <input
              id="species2"
              type="text"
              value={species2}
              onChange={(e) => setSpecies2(e.target.value)}
              placeholder="e.g. Common Tern"
            />
          </div>
          <div>
            <label htmlFor="numQuestions">Number of Questions:</label>
            <input
              id="numQuestions"
              type="number"
              min="1"
              max="20"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              placeholder="5"
            />
          </div>
          <button onClick={handleStartQuiz}>Start Quiz</button>
        </div>
      ) : (
        <div>
          {loading ? (
            <p>Loading images...</p>
          ) : images.length > 0 && currentIndex < images.length ? (
            <div>
              <img
                src={images[currentIndex].url}
                alt="Bird"
                style={{ maxWidth: "400px", borderRadius: "10px" }}
              />
              <div style={{ marginTop: "20px" }}>
                {/* Dynamic guesses based on the user's input */}
                <button onClick={() => handleGuess(species1)}>{species1}</button>
                <button onClick={() => handleGuess(species2)}>{species2}</button>
              </div>
              <div style={{ marginTop: "20px", fontWeight: "bold" }}>
                {feedback}
              </div>
            </div>
          ) : (
            <div>
              <h2>Your Score: {score} / {numQuestions}</h2>
              <p>Thank you for playing!</p>
              <button onClick={() => handleRestartQuiz("newSpecies")}>Start Over with New Species</button>
              <button onClick={() => handleRestartQuiz("sameSpecies")}>Restart with Same Species, New Photos</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BirdQuiz;

