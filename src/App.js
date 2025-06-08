import React, { useState, useEffect } from "react";
import SHA256 from "crypto-js/sha256";
import "./App.css";

function calculateHash(block) {
  const { index, timestamp, data, amount, transaction, previousHash, nonce } = block;
  return SHA256(index + timestamp + data + amount + transaction + previousHash + nonce).toString();
}

function createGenesisBlock() {
  return {
    index: 0,
    timestamp: new Date().toLocaleString(),
    data: "Genesis Block",
    amount: "0",
    transaction: "0x0000->0x0000",
    previousHash: "0",
    nonce: 0,
    hash: calculateHash({
      index: 0,
      timestamp: new Date().toLocaleString(),
      data: "Genesis Block",
      amount: "0",
      transaction: "0x0000->0x0000",
      previousHash: "0",
      nonce: 0
    })
  };
}

function App() {
  const [blockchain, setBlockchain] = useState([]);
  const [difficulty, setDifficulty] = useState(4);
  const [log, setLog] = useState("");

  useEffect(() => {
    // Initialize with genesis block and two sample blocks
    const genesis = createGenesisBlock();
    const block1 = {
      index: 1,
      timestamp: new Date().toLocaleString(),
      data: "Block #1 Data",
      amount: "1",
      transaction: "0x0000->0x0000",
      previousHash: genesis.hash,
      nonce: 0,
      hash: ""
    };
    const block2 = {
      index: 2,
      timestamp: new Date().toLocaleString(),
      data: "Block #2 Data",
      amount: "0.5",
      transaction: "0x0000->0x0000",
      previousHash: "",
      nonce: 0,
      hash: ""
    };
    setBlockchain([genesis, block1, block2]);
  }, []);

  const mineBlock = (index) => {
    if (index === 0) {
      setLog("Genesis block cannot be mined");
      return;
    }

    const newChain = [...blockchain];
    const target = Array(difficulty + 1).join("0");
    const block = newChain[index];
    const prevBlock = newChain[index - 1];

    // Update previousHash to the current hash of the previous block
    block.previousHash = prevBlock.hash;
    block.nonce = 0;

    const start = performance.now();

    while (true) {
      block.hash = calculateHash(block);
      if (block.hash.startsWith(target)) break;
      block.nonce++;
    }

    const end = performance.now();
    const timeTaken = (end - start).toFixed(2);

    newChain[index] = block;
    setBlockchain(newChain);
    setLog(`Block ${index} mined in ${timeTaken} ms | Nonce: ${block.nonce}`);
  };

  const addNewBlock = () => {
    const lastBlock = blockchain[blockchain.length - 1];
    const newBlock = {
      index: blockchain.length,
      timestamp: new Date().toLocaleString(),
      data: `Block #${blockchain.length} Data`,
      amount: (Math.random() * 2).toFixed(1),
      transaction: "0x0000->0x0000",
      previousHash: lastBlock.hash,
      nonce: 0,
      hash: ""
    };
    setBlockchain([...blockchain, newBlock]);
  };

  const handleAmountChange = (index, value) => {
    const newChain = [...blockchain];
    newChain[index].amount = value;
    
    // Special handling for Genesis Block (index 0)
    if (index === 0) {
      newChain[0].hash = calculateHash(newChain[0]);
      // Break the chain by not updating subsequent blocks
      if (newChain.length > 1) {
        newChain[1].previousHash = newChain[0].hash;
        // Invalidate hashes of all subsequent blocks
        for (let i = 1; i < newChain.length; i++) {
          if (newChain[i].hash) {
            newChain[i].hash = "";
          }
        }
      }
    }
    
    setBlockchain(newChain);
    setLog(`Block ${index} amount updated. Chain may be invalid.`);
  };

  const handleTransactionChange = (index, value) => {
    const newChain = [...blockchain];
    newChain[index].transaction = value;
    
    // Special handling for Genesis Block (index 0)
    if (index === 0) {
      newChain[0].hash = calculateHash(newChain[0]);
      // Break the chain by not updating subsequent blocks
      if (newChain.length > 1) {
        newChain[1].previousHash = newChain[0].hash;
        // Invalidate hashes of all subsequent blocks
        for (let i = 1; i < newChain.length; i++) {
          if (newChain[i].hash) {
            newChain[i].hash = "";
          }
        }
      }
    }
    
    setBlockchain(newChain);
    setLog(`Block ${index} transaction updated. Chain may be invalid.`);
  };

  const renderBlock = (block, index) => {
    const isValid = index === 0 || block.previousHash === blockchain[index - 1]?.hash;
    
    // Safely get mining time from log
    const miningTime = log.includes(`Block ${index} mined`) 
      ? log.split('Block')[1].split('mined in')[1]?.split('ms')[0]?.trim() || '?'
      : '?';

    return (
      <div key={index} style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px',
        backgroundColor: '#f9f9f9',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: 0 }}>Block #{block.index}</h3>
        <p><strong>Data:</strong> {block.data}</p>
        
        <div style={{ display: 'flex', margin: '10px 0' }}>
          <div style={{ flex: 1 }}>
            <p><strong>Amount:</strong></p>
            <input
              type="text"
              value={block.amount}
              onChange={(e) => handleAmountChange(index, e.target.value)}
              style={{
                fontSize: '24px',
                width: '80px',
                padding: '5px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>
          <div style={{ flex: 2 }}>
            <p><strong>Transaction:</strong></p>
            <input
              type="text"
              value={block.transaction}
              onChange={(e) => handleTransactionChange(index, e.target.value)}
              style={{
                fontFamily: 'monospace',
                width: '100%',
                padding: '5px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>
        
        <p><strong>Previous Hash:</strong></p>
        <p style={{ 
          fontFamily: 'monospace', 
          fontSize: '12px', 
          wordBreak: 'break-all',
          color: isValid ? '#333' : 'red'
        }}>
          {block.previousHash || 'Not mined yet'}
        </p>
        
        <p><strong>Hash:</strong></p>
        <p style={{ 
          fontFamily: 'monospace', 
          fontSize: '12px', 
          wordBreak: 'break-all',
          color: block.hash ? '#333' : 'red'
        }}>
          {block.hash || 'Not mined yet'}
        </p>
        
        <p><strong>Nonce:</strong> {block.hash ? block.nonce : '?'}</p>
        
        {block.hash && (
          <p style={{ color: '#666', fontSize: '12px' }}>
            Mined in: {miningTime} ms
          </p>
        )}
        
        <button 
          onClick={() => mineBlock(index)}
          disabled={index === 0}
          style={{
            backgroundColor: index === 0 ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: index === 0 ? 'not-allowed' : 'pointer',
            marginTop: '10px'
          }}
        >
          Mine Block
        </button>
      </div>
    );
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center' }}>Blockchain Simulation</h1>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div>
          <label><strong>Difficulty: </strong></label>
          <input 
            type="number" 
            min="1" 
            max="6" 
            value={difficulty} 
            onChange={(e) => setDifficulty(parseInt(e.target.value))}
            style={{ width: '50px', padding: '5px' }}
          />
        </div>
        <button 
          onClick={addNewBlock}
          style={{
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Add New Block
        </button>
      </div>
      
      <div>
        {blockchain.map((block, index) => renderBlock(block, index))}
      </div>
      
      {log && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#f0f0f0',
          borderRadius: '4px'
        }}>
          <strong>Log:</strong> {log}
        </div>
      )}
    </div>
  );
}

export default App;