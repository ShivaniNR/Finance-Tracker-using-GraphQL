import React, { useEffect, useState } from 'react';
import { Mic } from 'lucide-react';
import { usePromptAPI } from '../hooks/usePromptAPI';


export const QuickAddModal = ({ isOpen, onClose, onSubmit, isVoiceMode, setIsVoiceMode, editingTransaction }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [category, setCategory] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const { isReady, parseTransaction, error: promptError } = usePromptAPI();

  const isEditing = !!editingTransaction;

  //populate form when editing
  useEffect(() => {
    if (editingTransaction){
      setAmount(editingTransaction.amount);
      setDescription(editingTransaction.description);
      setType(editingTransaction.type);
      setCategory(editingTransaction.category);
    }
    else{
      setAmount('');
      setDescription('');
      setType('EXPENSE');
      setCategory('');
    }
  }, [editingTransaction, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault();
    if (amount && description) {

      const transactionData = {
        amount: parseFloat(amount),
        description,
        type,
        ...(category && { category })
      };

      // If editing, include the ID
      if (isEditing) {
        transactionData.id = editingTransaction.id;
      }


      onSubmit(transactionData);
      // Only reset form if adding new transaction
      if (!isEditing) {
        setAmount('');
        setDescription('');
        setCategory('');
      }
      onClose();
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      console.log("Ready to listen");
    };

    recognition.onresult = (event) => {
      console.log('Speech recognized:', event);
      const transcript = event.results[0][0].transcript;
      parseVoiceInput(transcript);
      setIsListening(false);
    };

    recognition.onspeechend = function () {
      recognition.stop();
    };

    recognition.onerror = () => {
      setIsListening(false);
      alert('Could not recognize speech. Please try again.');
    };

    recognition.start();
  };

  const parseVoiceInput = async (transcript) => {
    // Simple parsing - in real app, you'd use OpenAI API
    const text = transcript.toLowerCase();
    // const amountMatch = text.match(/(\d+(?:\.\d{2})?)/);
    // const spentWords = ['spent', 'paid', 'bought', 'purchase'];
    // const earnedWords = ['earned', 'received', 'got paid', 'income'];
    
    
    
    // const isExpense = spentWords.some(word => text.includes(word));
    // const isIncome = earnedWords.some(word => text.includes(word));

    //PromptAPI using for better parsing
    setIsParsing(true);
    try{
      const parsedTransaction = await parseTransaction(text);
        if (parsedTransaction.amount) {
          setAmount(parsedTransaction.amount);
        }

        if (parsedTransaction.type === 'INCOME') {
          setType('INCOME');
        } else {
          setType('EXPENSE');
        }
      setCategory(parsedTransaction.category || '');
      
      setDescription(parsedTransaction.description || transcript);
      }catch(err){
        console.error('Error parsing transaction:', err);
        alert('Could not parse transaction. Please try again.');
      }
      setIsParsing(false);
  };

  if (!isOpen) return null;

  if (promptError) {
    return (
      <div className="voice-input-error">
        <p>Prompt API not available: {promptError}</p>
        <p>Please use manual entry instead.</p>
        {/* <button onClick={onCancel}>Cancel</button> */}
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Transaction': 'Add Transaction'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="transaction-type-toggle">
            <button
              type="button"
              className={`toggle-btn ${type === 'EXPENSE' ? 'active expense' : ''}`}
              onClick={() => setType('EXPENSE')}
            >
              Expense
            </button>
            <button
              type="button"
              className={`toggle-btn ${type === 'INCOME' ? 'active income' : ''}`}
              onClick={() => setType('INCOME')}
            >
              Income
            </button>
          </div>
          
          <div className="form-group">
            <label>Amount</label>
            <div className="amount-input">
              <span className="currency">$</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <div className="description-input">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What did you spend on?"
                required
              />
              <button
                type="button"
                className={`voice-btn ${isListening ? 'listening' : ''}`}
                onClick={startVoiceInput}
                disabled={isListening || isParsing  || !isReady}
              >
                <Mic size={16} />
              </button>
            </div>
            {!isReady && <p>🤖 Loading AI assistant...</p>}
            {isListening && <p className="voice-status">Listening... speak now!</p>}
            {isParsing && <p>🧠 Analyzing transaction...</p>}
          </div>

          <div className="form-group">
            <label>Category</label>
            <div className="description-input">
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="What is the category?"
              />
            </div>
            {isListening && <p className="voice-status">Listening... speak now!</p>}
          </div>
          
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {isEditing? 'Update Transaction': 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};