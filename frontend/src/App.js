import React, { useState, useEffect } from 'react';
import './App.css'; // Import the styles from styles.css

const data = {
  currentLevel: 1,
  levelContent: {
    1: {
      tldr: "Quantum computing is like a super-powered computer that can solve some problems much faster than regular computers.",
      topics: [
        { topic: "Qubit", detail: "The basic unit of quantum information, like a bit in regular computers but more powerful." },
        { topic: "Superposition", detail: "A qubit can be both 0 and 1 at the same time, unlike regular bits." },
        { topic: "Entanglement", detail: "A special connection between qubits that lets them share information instantly." },
        { topic: "Quantum Gate", detail: "A tool that changes the state of a qubit, like a switch for regular bits." },
        { topic: "Quantum Speedup", detail: "The ability of quantum computers to solve some problems faster than regular ones." }
      ]
    },
    2: {
      tldr: "Quantum computing uses qubits that can be in multiple states at once, allowing for faster problem solving.",
      topics: [
        { topic: "Qubit", detail: "A quantum bit that can be in a superposition of 0 and 1." },
        { topic: "Superposition", detail: "A qubit's ability to be in multiple states at once." },
        { topic: "Entanglement", detail: "A phenomenon where qubits become linked and share states." },
        { topic: "Quantum Gate", detail: "Operations that change qubit states and perform quantum logic." },
        { topic: "Quantum Speedup", detail: "The potential for quantum computers to outperform classical computers on certain tasks." }
      ]
    },
    3: {
      tldr: "Quantum computers use principles of quantum mechanics to process information in ways that classical computers can't, potentially solving complex problems faster.",
      topics: [
        { topic: "Qubit", detail: "A basic unit of quantum information that can be in superposition, representing both 0 and 1 simultaneously." },
        { topic: "Superposition", detail: "The ability of qubits to be in multiple states at once, enabling parallelism in computation." },
        { topic: "Entanglement", detail: "A unique property where qubits become correlated, meaning the state of one instantly influences the state of another." },
        { topic: "Quantum Gate", detail: "A quantum operation that manipulates qubits' states, essential for building quantum circuits." },
        { topic: "Quantum Speedup", detail: "The significant performance improvement for specific problems achieved by quantum algorithms." }
      ]
    },
    4: {
      tldr: "Quantum computing harnesses quantum bits and principles like superposition and entanglement to perform certain computations more efficiently than classical computers.",
      topics: [
        { topic: "Qubit", detail: "Quantum bits that exploit superposition and entanglement to perform complex calculations." },
        { topic: "Superposition", detail: "A property of qubits allowing them to be in a combination of multiple states simultaneously." },
        { topic: "Entanglement", detail: "A phenomenon where pairs or groups of qubits interact in ways that make their states interdependent." },
        { topic: "Quantum Gate", detail: "Fundamental building blocks of quantum circuits, applying specific transformations to qubits." },
        { topic: "Quantum Speedup", detail: "The advantage quantum computers have over classical computers in solving certain types of problems." }
      ]
    },
    5: {
      tldr: "Quantum computing applies the principles of quantum mechanics to process information, using qubits, superposition, and entanglement to perform computations more efficiently for certain tasks.",
      topics: [
        { topic: "Qubit", detail: "The fundamental unit of quantum information, capable of representing and processing more information than classical bits." },
        { topic: "Superposition", detail: "Allows qubits to represent multiple states simultaneously, exponentially increasing computing power." },
        { topic: "Entanglement", detail: "Links qubits in a way that the state of one can instantaneously affect the state of another, regardless of distance." },
        { topic: "Quantum Gate", detail: "Devices that perform operations on qubits, forming the basis of quantum circuits and algorithms." },
        { topic: "Quantum Speedup", detail: "The potential for quantum algorithms to solve problems significantly faster than classical algorithms." }
      ]
    },
    6: {
      tldr: "Quantum computing leverages qubits, superposition, and entanglement to solve complex problems more efficiently than classical computers, with potential applications in various fields.",
      topics: [
        { topic: "Qubit", detail: "Quantum analogs to classical bits, representing and processing information through quantum states." },
        { topic: "Superposition", detail: "Enables qubits to exist in a combination of all possible states, facilitating parallel computation." },
        { topic: "Entanglement", detail: "A quantum phenomenon creating correlations between qubits, essential for quantum communication and computation." },
        { topic: "Quantum Gate", detail: "Operations that manipulate the state of qubits, essential for creating quantum algorithms." },
        { topic: "Quantum Speedup", detail: "The enhanced efficiency and speed of quantum algorithms compared to classical ones for specific tasks." }
      ]
    },
    7: {
      tldr: "Quantum computing utilizes the principles of quantum mechanics, including qubits, superposition, and entanglement, to achieve computational advantages over classical systems in specific applications.",
      topics: [
        { topic: "Qubit", detail: "The basic unit of quantum information, leveraging superposition and entanglement for enhanced computational power." },
        { topic: "Superposition", detail: "Allows a qubit to be in a combination of multiple states simultaneously, enabling parallel processing." },
        { topic: "Entanglement", detail: "Creates strong correlations between qubits, crucial for quantum computing and communication protocols." },
        { topic: "Quantum Gate", detail: "Unitary transformations applied to qubits, enabling the construction of complex quantum circuits." },
        { topic: "Quantum Speedup", detail: "The theoretical advantage quantum algorithms have over classical algorithms for solving certain computational problems." }
      ]
    },
    8: {
      tldr: "Quantum computing exploits quantum phenomena such as superposition and entanglement to perform computations more efficiently than classical computers for specific tasks, with profound implications for various scientific and industrial fields.",
      topics: [
        { topic: "Qubit", detail: "Quantum bits that serve as the fundamental units of information in quantum computing, enabling new computational paradigms." },
        { topic: "Superposition", detail: "The principle that allows qubits to be in multiple states at once, providing massive parallelism in computation." },
        { topic: "Entanglement", detail: "A quantum effect that creates strong, non-classical correlations between qubits, essential for many quantum algorithms." },
        { topic: "Quantum Gate", detail: "The basic operations that manipulate qubit states, forming the building blocks of quantum algorithms." },
        { topic: "Quantum Speedup", detail: "The significant computational efficiency achieved by quantum algorithms for certain classes of problems, far surpassing classical methods." }
      ]
    },
    9: {
      tldr: "Quantum computing leverages the principles of quantum mechanics to perform computations with qubits, superposition, and entanglement, offering exponential speedups for certain tasks and transformative potential in fields like cryptography, optimization, and materials science.",
      topics: [
        { topic: "Qubit", detail: "The basic unit of quantum information, enabling quantum computers to represent and process information using quantum states." },
        { topic: "Superposition", detail: "A foundational concept that allows qubits to exist in a linear combination of states, enabling simultaneous computation." },
        { topic: "Entanglement", detail: "A quantum mechanical phenomenon creating strong correlations between qubits, critical for quantum computation and communication." },
        { topic: "Quantum Gate", detail: "Fundamental operations that perform unitary transformations on qubits, forming the core of quantum circuits and algorithms." },
        { topic: "Quantum Speedup", detail: "The exponential increase in computational efficiency provided by quantum algorithms for certain classes of problems, compared to classical approaches." }
      ]
    },
    10: {
      tldr: "Quantum computing leverages qubits, superposition, and entanglement to perform complex calculations efficiently, offering potential advancements in cryptography, optimization, and computational chemistry.",
      topics: [
        { topic: "Qubit", detail: "The fundamental unit of quantum information, analogous to a classical bit but capable of existing in superposition states." },
        { topic: "Superposition", detail: "A principle allowing qubits to be in a combination of states simultaneously, providing a parallelism advantage." },
        { topic: "Entanglement", detail: "A non-classical correlation between qubits that enables instantaneous state transfer, essential for quantum algorithms and error correction." },
        { topic: "Quantum Gate", detail: "Unitary transformations applied to qubits, forming the basis of quantum circuits and algorithms." },
        { topic: "Quantum Speedup", detail: "The theoretical and practical improvements in solving certain computational problems, attributed to quantum algorithms such as Shor's and Grover's." }
      ]
    }
  }
};

function App() {
  const [currentLevel, setCurrentLevel] = useState(1);

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    console.log(`Width: ${width}, Height: ${height}`);
  }, []);

  const changeLevel = (change) => {
    setCurrentLevel(prevLevel => Math.min(Math.max(prevLevel + change, 1), 10));
  };

  const levelContent = data.levelContent[currentLevel];

  return (
    <div className="box">
      <div className="header">
        <div className="title">Information</div>
        <div className="controls">
          <button className="button" disabled={currentLevel === 1} onClick={() => changeLevel(-1)}>-</button>
          <span id="currentLevel">Level {currentLevel}</span>
          <button className="button" disabled={currentLevel === 10} onClick={() => changeLevel(1)}>+</button>
        </div>
      </div>
      <div className="content">
        <div id="tldr">{levelContent.tldr}</div>
        <ul id="topics">
          {levelContent.topics.map((topic, index) => (
            <li key={index}>{topic.topic}: {topic.detail}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
