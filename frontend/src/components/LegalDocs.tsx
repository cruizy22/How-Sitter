import React from 'react';

export const LegalDocs: React.FC = () => {
  return (
    <div id="legal" className="max-w-4xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-dark mb-4">Agreements & Legal Framework</h2>
        <p className="text-lg text-gray">
          Built on trust, backed by clear legal templates for secure house-sitting arrangements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        <div className="bg-white p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <i className="fas fa-user-shield text-primary text-2xl"></i>
          </div>
          <h3 className="text-2xl font-bold mb-6">Sitter Agreement</h3>
          <ul className="space-y-5">
            {[
              'Care for property in safe, clean, respectful manner',
              'Follow all house rules and homeowner instructions',
              'Provide regular updates as agreed upon',
              'Respect privacy and confidentiality',
              'Maintain open communication via WhatsApp',
              'Report any issues or damages immediately'
            ].map((item, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <i className="fas fa-check text-primary text-xs"></i>
                </div>
                <span className="text-gray">{item}</span>
              </li>
            ))}
          </ul>
          <button className="mt-8 w-full bg-primary text-white py-3.5 rounded-lg font-semibold hover:bg-primary-hover transition-colors">
            Download Template
          </button>
        </div>
        
        <div className="bg-white p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-6">
            <i className="fas fa-home text-secondary text-2xl"></i>
          </div>
          <h3 className="text-2xl font-bold mb-6">Homeowner Agreement</h3>
          <ul className="space-y-5">
            {[
              'Provide safe, clean, and functional property',
              'Clear communication of expectations and house rules',
              'Respect sitter privacy during arrangement',
              'Provide emergency contact information',
              'Disclose any property issues or concerns',
              'Agree on communication frequency and method'
            ].map((item, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center mr-3">
                  <i className="fas fa-check text-secondary text-xs"></i>
                </div>
                <span className="text-gray">{item}</span>
              </li>
            ))}
          </ul>
          <button className="mt-8 w-full bg-secondary text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Download Template
          </button>
        </div>
      </div>

      {/* Notice Template */}
      <div className="bg-light-gray p-8 md:p-12 rounded-2xl border-2 border-dashed border-gray-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h3 className="text-2xl font-bold text-dark">Notice to Vacate Template</h3>
            <p className="text-gray uppercase tracking-widest text-xs font-bold mt-1">Legal Document Template</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-dark text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-800">
              <i className="fas fa-file-pdf"></i> Download PDF
            </button>
            <button className="bg-white text-dark border border-border px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-light-gray">
              <i className="fas fa-edit"></i> Customize
            </button>
          </div>
        </div>

        <div className="bg-white p-10 shadow-sm rounded-xl font-serif text-sm leading-relaxed">
          <h4 className="text-center font-bold text-xl mb-8 uppercase text-dark border-b border-border pb-4">
            Notice to Vacate and Deliver Up Possession
          </h4>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block uppercase text-xs font-bold text-gray mb-2">To (Sitter Name):</label>
                <div className="border-b border-border pb-2 italic text-gray">[SITTER NAME]</div>
              </div>
              <div>
                <label className="block uppercase text-xs font-bold text-gray mb-2">Property Address:</label>
                <div className="border-b border-border pb-2 italic text-gray">[STREET, CITY, POSTAL CODE]</div>
              </div>
            </div>

            <div className="space-y-4">
              <p>You are hereby notified that your house-sitting arrangement at the above-described premises is hereby terminated.</p>
              <p>You are required to vacate and deliver up possession of said premises to the undersigned within <strong>FIVE (5) DAYS</strong> after service of this notice upon you.</p>
            </div>

            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex items-start">
                <i className="fas fa-exclamation-triangle text-red-400 mt-1 mr-3"></i>
                <div>
                  <p className="font-bold text-red-700">Important Notice</p>
                  <p className="text-red-600 text-sm mt-1">Failure to comply with this notice may result in legal action. Please ensure all personal belongings are removed and the property is returned in its original condition.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <div>
                <label className="block uppercase text-xs font-bold text-gray mb-2">Reason for Termination:</label>
                <div className="border border-border rounded-lg p-3 min-h-[60px] text-gray">[Specify reason for termination]</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block uppercase text-xs font-bold text-gray mb-2">Homeowner Signature:</label>
                  <div className="border-b border-border pb-2 h-8"></div>
                </div>
                <div>
                  <label className="block uppercase text-xs font-bold text-gray mb-2">Date:</label>
                  <div className="border-b border-border pb-2 h-8 text-gray">[MM/DD/YYYY]</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray text-sm">
            This template is provided for informational purposes. Consult with legal counsel for specific advice.
          </p>
        </div>
      </div>
    </div>
  );
};