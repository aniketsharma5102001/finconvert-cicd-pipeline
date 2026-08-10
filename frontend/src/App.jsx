import { useState } from 'react'

function App() {
  const [amount, setAmount] = useState(1000);
  const [baseCurrency, setBaseCurrency] = useState('INR');
  const [targetCurrency, setTargetCurrency] = useState('USD');
  const [result, setResult] = useState(null);
  const [rate, setRate] = useState(null);
  const [isError, setIsError] = useState(false);

  const swapCurrencies = () => {
    setBaseCurrency(targetCurrency);
    setTargetCurrency(baseCurrency);
    setResult(null);
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    setIsError(false);
    
    const apiUrl = import.meta.env.VITE_API_URL  ||  'http://localhost:5000';
    
    try {
      const response = await fetch(`${apiUrl}/api/convert?amount=${amount}&base=${baseCurrency}&target=${targetCurrency}`);
      const data = await response.json();
      
      if (response.ok && data.convertedAmount) {
        setResult(data.convertedAmount);
        setRate((data.convertedAmount / amount).toFixed(4));
      } else {
        setIsError(true);
        setResult(null);
      }
    } catch (error) {
      console.error("Error fetching conversion:", error);
      setIsError(true);
      setResult(null);
    }
  };

  return (
    <div className="bg-[#f7f9fb] dark:bg-[#0f172a] text-[#191c1e] dark:text-[#f8fafc] font-sans antialiased min-h-screen flex flex-col transition-colors duration-300">
      {/* TopNavBar */}
      <header className="bg-white dark:bg-[#1e293b] shadow-sm docked full-width top-0 z-50 transition-colors duration-300">
        <div className="flex justify-between items-center w-full px-6 max-w-[1280px] mx-auto h-16">
          {/* Brand */}
          <div className="text-2xl font-bold text-[#004ac6] dark:text-[#b4c5ff] flex items-center gap-2">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>currency_exchange</span>{' '}
            FinConvert
          </div>
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button type="button" className="text-[#004ac6] dark:text-[#b4c5ff] border-b-2 border-[#004ac6] dark:border-[#b4c5ff] pb-1 font-semibold text-sm hover:opacity-80 transition-colors bg-transparent cursor-pointer">Dashboard</button>
           
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-6 py-12 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-[#191c1e] dark:text-white tracking-tight">Convert Currencies Instantly</h1>
          <p className="text-lg text-[#434655] dark:text-[#94a3b8]">Real-time exchange rates with precision and transparency. Your trusted tool for global financial transactions.</p>
        </section>

        {/* Converter Core */}
        <section className="relative z-10 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-[#1e293b] rounded-lg shadow-md border border-[#e0e3e5] dark:border-[#334155] p-6 md:p-8 relative transition-colors duration-300">
            <form onSubmit={handleConvert}>
              <div className="flex flex-col md:flex-row items-center gap-6">
                
                {/* Amount Input */}
                <div className="flex-1 w-full flex flex-col gap-2">
                  <label htmlFor="amount" className="text-xs font-semibold text-[#004ac6] dark:text-[#b4c5ff]">Amount</label>
                  <div className="relative">
                    <input 
                      id="amount"
                      type="number" 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)} 
                      min="1"
                      className="w-full bg-white dark:bg-[#0f172a] border border-[#c3c6d7] dark:border-[#475569] rounded px-4 py-3 text-2xl text-[#191c1e] dark:text-white focus:border-[#004ac6] dark:focus:border-[#b4c5ff] focus:ring-4 focus:ring-[#004ac6]/15 transition-all outline-none" 
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-[#434655] dark:text-[#94a3b8]">{baseCurrency}</span>
                  </div>
                </div>

                {/* From/To Controls */}
                <div className="flex-1 w-full flex flex-col md:flex-row items-center gap-4">
                  <div className="w-full flex flex-col gap-2">
                    <label htmlFor="baseCurrency" className="text-xs font-semibold text-[#004ac6] dark:text-[#b4c5ff]">From</label>
                    <div className="relative">
                      <select 
                        id="baseCurrency"
                        value={baseCurrency}
                        onChange={(e) => setBaseCurrency(e.target.value)}
                        className="w-full bg-white dark:bg-[#0f172a] border border-[#c3c6d7] dark:border-[#475569] rounded py-3 pl-4 pr-8 text-base text-[#191c1e] dark:text-white focus:border-[#004ac6] dark:focus:border-[#b4c5ff] focus:ring-4 focus:ring-[#004ac6]/15 transition-all outline-none appearance-none cursor-pointer"
                      >
                        <option value="USD">🇺🇸 USD - US Dollar</option>
                        <option value="EUR">🇪🇺 EUR - Euro</option>
                        <option value="GBP">🇬🇧 GBP - British Pound</option>
                        <option value="INR">🇮🇳 INR - Indian Rupee</option>
                        <option value="JPY">🇯🇵 JPY - Japanese Yen</option>
                        <option value="CAD">🇨🇦 CAD - Canadian Dollar</option>
                        <option value="AUD">🇦🇺 AUD - Australian Dollar</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#434655] dark:text-[#94a3b8] pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  {/* Swap Button */}
                  <div className="flex items-end justify-center pt-6 md:pt-0">
                    <button 
                      type="button" 
                      onClick={swapCurrencies}
                      className="w-10 h-10 rounded-full bg-[#eceef0] dark:bg-[#334155] border border-[#c3c6d7] dark:border-[#475569] flex items-center justify-center text-[#191c1e] dark:text-white hover:border-[#004ac6] dark:hover:border-[#b4c5ff] hover:text-[#004ac6] dark:hover:text-[#b4c5ff] transition-all shadow-sm cursor-pointer"
                    >
                      <span className="material-symbols-outlined">sync_alt</span>
                    </button>
                  </div>

                  <div className="w-full flex flex-col gap-2">
                    <label htmlFor="targetCurrency" className="text-xs font-semibold text-[#004ac6] dark:text-[#b4c5ff]">To</label>
                    <div className="relative">
                      <select 
                        id="targetCurrency"
                        value={targetCurrency}
                        onChange={(e) => setTargetCurrency(e.target.value)}
                        className="w-full bg-white dark:bg-[#0f172a] border border-[#c3c6d7] dark:border-[#475569] rounded py-3 pl-4 pr-8 text-base text-[#191c1e] dark:text-white focus:border-[#004ac6] dark:focus:border-[#b4c5ff] focus:ring-4 focus:ring-[#004ac6]/15 transition-all outline-none appearance-none cursor-pointer"
                      >
                        <option value="USD">🇺🇸 USD - US Dollar</option>
                        <option value="EUR">🇪🇺 EUR - Euro</option>
                        <option value="GBP">🇬🇧 GBP - British Pound</option>
                        <option value="INR">🇮🇳 INR - Indian Rupee</option>
                        <option value="JPY">🇯🇵 JPY - Japanese Yen</option>
                        <option value="CAD">🇨🇦 CAD - Canadian Dollar</option>
                        <option value="AUD">🇦🇺 AUD - Australian Dollar</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#434655] dark:text-[#94a3b8] pointer-events-none">expand_more</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Row */}
              <div className="flex justify-end pt-6 mt-6 border-t border-[#e0e3e5] dark:border-[#334155]">
                <button type="submit" className="bg-[#2563eb] dark:bg-[#b4c5ff] text-white dark:text-[#00174b] font-semibold text-sm py-3 px-6 rounded hover:bg-[#2563eb]/90 dark:hover:bg-[#b4c5ff]/90 active:scale-95 transition-all flex items-center gap-2 shadow-sm cursor-pointer">
                  Convert <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </form>
          </div>

          {/* Error State */}
          {isError && (
             <div className="mt-6 bg-[#ffdad6] dark:bg-[#93000a] rounded-lg shadow-md border border-[#ba1a1a] dark:border-[#ffdad6] p-6 text-center text-[#93000a] dark:text-[#ffdad6] font-semibold">
               Unable to fetch exchange rate. Please try again later.
             </div>
          )}

          {/* Result Card */}
          {result !== null && !isError && (
            <div className="mt-6 bg-white dark:bg-[#1e293b] rounded-lg shadow-lg border border-[#004ac6]/20 dark:border-[#b4c5ff]/20 p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-[fade-in-up_0.3s_ease-out] transition-colors duration-300">
              <div>
                <div className="text-base text-[#434655] dark:text-[#94a3b8] mb-1">{amount.toLocaleString()} {baseCurrency} =</div>
                <div className="text-4xl font-bold text-[#191c1e] dark:text-white">{result.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span className="text-[#004ac6] dark:text-[#b4c5ff] text-3xl font-semibold">{targetCurrency}</span></div>
                <div className="text-sm text-[#434655] dark:text-[#94a3b8] mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">info</span> 1 {baseCurrency} = {rate} {targetCurrency}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" className="w-10 h-10 rounded-full bg-[#eceef0] dark:bg-[#334155] hover:bg-[#e0e3e5] dark:hover:bg-[#475569] text-[#434655] dark:text-[#94a3b8] flex items-center justify-center transition-colors cursor-pointer" title="Copy Result">
                  <span className="material-symbols-outlined text-[20px]">content_copy</span>
                </button>
                <button type="button" className="w-10 h-10 rounded-full bg-[#eceef0] dark:bg-[#334155] hover:bg-[#e0e3e5] dark:hover:bg-[#475569] text-[#434655] dark:text-[#94a3b8] flex items-center justify-center transition-colors cursor-pointer" title="Share">
                  <span className="material-symbols-outlined text-[20px]">share</span>
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#1e293b] border-t border-[#c3c6d7] dark:border-[#334155] mt-auto transition-colors duration-300">
        <div className="w-full py-8 px-6 max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-semibold text-sm text-[#191c1e] dark:text-white opacity-80 hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>currency_exchange</span>{' '}
            FinConvert
          </div>
          <div className="text-sm text-[#434655] dark:text-[#94a3b8]">
            © 2026 FinConvert. Precision in Every Exchange.
          </div>
          <nav className="flex flex-wrap justify-center gap-4 text-xs font-semibold">
            <button type="button" className="text-[#434655] dark:text-[#94a3b8] hover:text-[#004ac6] dark:hover:text-[#b4c5ff] hover:underline transition-all bg-transparent cursor-pointer">Documentation</button>
            <button type="button" className="text-[#434655] dark:text-[#94a3b8] hover:text-[#004ac6] dark:hover:text-[#b4c5ff] hover:underline transition-all bg-transparent cursor-pointer">GitHub</button>
            <button type="button" className="text-[#434655] dark:text-[#94a3b8] hover:text-[#004ac6] dark:hover:text-[#b4c5ff] hover:underline transition-all bg-transparent cursor-pointer">Release Notes</button>
            <button type="button" className="text-[#434655] dark:text-[#94a3b8] hover:text-[#004ac6] dark:hover:text-[#b4c5ff] hover:underline transition-all bg-transparent cursor-pointer">Privacy Policy</button>
          </nav>
        </div>
      </footer>
    </div>
  )
}

export default App