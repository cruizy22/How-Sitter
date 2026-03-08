import React from 'react';

export const LegalDocs: React.FC = () => {
  return (
    <div id="legal" className="max-w-6xl mx-auto px-4 py-20">
      {/* How Sitter Brand Header */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center mr-4 shadow-xl">
            <i className="fas fa-gavel text-white text-2xl"></i>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">How Sitter</h1>
            <p className="text-green-600 font-medium">Legal Framework & Agreements</p>
          </div>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Built on trust, backed by clear legal templates for secure house-sitting arrangements.
          All agreements include 5-day Notice to Vacate clauses.
        </p>
      </div>

      {/* Mandatory Discovery Section */}
      <div className="mb-16 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border-2 border-green-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <i className="fas fa-shield-check text-green-600 mr-3 text-2xl"></i>
          Mandatory Discovery Requirements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">For House Sitters</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <i className="fas fa-check text-green-600 text-xs"></i>
                </div>
                <span className="text-gray-700">Airbnb or VRBO profile verification</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <i className="fas fa-check text-green-600 text-xs"></i>
                </div>
                <span className="text-gray-700">Credit rating of 675 or higher</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <i className="fas fa-check text-green-600 text-xs"></i>
                </div>
                <span className="text-gray-700">Proof of bank balance showing financial stability</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <i className="fas fa-check text-green-600 text-xs"></i>
                </div>
                <span className="text-gray-700">LinkedIn profile (recommended)</span>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Purpose of Verification</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <i className="fas fa-shield-alt text-blue-600 text-xs"></i>
                </div>
                <span className="text-gray-700">Establish credibility and trust</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <i className="fas fa-user-check text-blue-600 text-xs"></i>
                </div>
                <span className="text-gray-700">Prevent bad actors from entering the platform</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <i className="fas fa-handshake text-blue-600 text-xs"></i>
                </div>
                <span className="text-gray-700">Build a secure community of verified users</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <i className="fas fa-ban text-blue-600 text-xs"></i>
                </div>
                <span className="text-gray-700">Bad actors reported in group chats and banned</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Agreement Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        {/* Sitter Agreement */}
        <div className="bg-white p-8 rounded-2xl border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mr-4">
              <i className="fas fa-user-shield text-green-600 text-2xl"></i>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Sitter Agreement</h3>
              <p className="text-green-600 text-sm font-medium">Fiduciary Responsibilities</p>
            </div>
          </div>
          <ul className="space-y-5">
            {[
              'Act as fiduciary to care for property in safe, clean, respectful manner',
              'Follow all house rules and homeowner instructions',
              'Provide regular updates via WhatsApp as agreed upon',
              'Respect privacy and maintain confidentiality',
              'Report any issues or damages immediately',
              'Indemnify both platform and homeowners',
              'Accept electronic 5-day Notice to Vacate',
              'Cannot sue homeowners under electronic agreement'
            ].map((item, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <i className="fas fa-check text-green-600 text-xs"></i>
                </div>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
          <button className="mt-8 w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3.5 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg">
            <i className="fas fa-download mr-2"></i>
            Download Electronic Template
          </button>
        </div>
        
        {/* Homeowner Agreement */}
        <div className="bg-white p-8 rounded-2xl border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              <i className="fas fa-home text-blue-600 text-2xl"></i>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Homeowner (Lister) Agreement</h3>
              <p className="text-blue-600 text-sm font-medium">Property Owner Responsibilities</p>
            </div>
          </div>
          <ul className="space-y-5">
            {[
              'Provide safe, clean, and fully functional property',
              'Clear communication of expectations and house rules',
              'Respect sitter privacy during arrangement',
              'Provide emergency contact information',
              'Disclose any property issues or concerns',
              'Cannot execute early eviction arbitrarily',
              'Agree on communication frequency via WhatsApp',
              'Provide non-hazardous environment for sitter'
            ].map((item, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <i className="fas fa-check text-blue-600 text-xs"></i>
                </div>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
          <button className="mt-8 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg">
            <i className="fas fa-download mr-2"></i>
            Download Electronic Template
          </button>
        </div>
      </div>

      {/* Notice to Vacate Template */}
      <div className="bg-gradient-to-br from-yellow-50 to-green-50 p-8 md:p-12 rounded-2xl border-2 border-dashed border-yellow-300 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center mb-2">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                <i className="fas fa-file-contract text-yellow-600 text-xl"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Electronic Notice to Vacate Template</h3>
                <p className="text-gray-600 uppercase tracking-widest text-xs font-bold mt-1">Standard in All Agreements</p>
              </div>
            </div>
            <p className="text-gray-600 mt-2">
              Every How Sitter agreement includes an automatic 5-day Notice to Vacate clause.
              This template is sent electronically when needed.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:from-gray-900 hover:to-black shadow-md">
              <i className="fas fa-file-pdf"></i> Download PDF
            </button>
            <button className="bg-white text-gray-800 border-2 border-gray-300 px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:border-green-500 hover:text-green-600 shadow-md">
              <i className="fas fa-edit"></i> Customize Template
            </button>
          </div>
        </div>

        <div className="bg-white p-10 shadow-inner rounded-xl font-serif text-sm leading-relaxed border border-gray-200">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <i className="fas fa-home text-green-600"></i>
              </div>
              <h4 className="font-bold text-xl text-gray-900 uppercase">
                How Sitter - Electronic Notice to Vacate
              </h4>
            </div>
            <p className="text-gray-600 text-sm">Standard 5-Day Notice Clause (Included in All Agreements)</p>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block uppercase text-xs font-bold text-gray-500 mb-2">To (Sitter Name):</label>
                <div className="border-b-2 border-gray-300 pb-2 italic text-gray-600">[SITTER NAME]</div>
              </div>
              <div>
                <label className="block uppercase text-xs font-bold text-gray-500 mb-2">Property Address:</label>
                <div className="border-b-2 border-gray-300 pb-2 italic text-gray-600">[STREET, CITY, POSTAL CODE]</div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700">You are hereby notified electronically that your house-sitting arrangement at the above-described premises is hereby terminated.</p>
              <p className="text-gray-700 font-medium">
                You are required to vacate and deliver up possession of said premises to the undersigned within 
                <span className="text-red-600 font-bold mx-1">FIVE (5) DAYS</span> 
                after electronic delivery of this notice.
              </p>
            </div>

            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
              <div className="flex items-start">
                <i className="fas fa-exclamation-triangle text-red-400 mt-1 mr-3 text-lg"></i>
                <div>
                  <p className="font-bold text-red-700 text-sm">Important Legal Notice</p>
                  <p className="text-red-600 text-sm mt-1">
                    Failure to comply with this electronic notice may result in legal action. 
                    Please ensure all personal belongings are removed and the property is returned 
                    in its original condition. This notice is electronically binding per your signed agreement.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <div>
                <label className="block uppercase text-xs font-bold text-gray-500 mb-2">Reason for Termination:</label>
                <div className="border-2 border-gray-300 rounded-lg p-3 min-h-[60px] text-gray-600 bg-gray-50">[Specify reason for termination - optional]</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block uppercase text-xs font-bold text-gray-500 mb-2">Homeowner (Lister) E-Signature:</label>
                  <div className="border-b-2 border-gray-300 pb-2 h-8 flex items-center">
                    <i className="fas fa-signature text-gray-400 mr-2"></i>
                    <span className="text-gray-500">Electronically signed via How Sitter platform</span>
                  </div>
                </div>
                <div>
                  <label className="block uppercase text-xs font-bold text-gray-500 mb-2">Date of Electronic Delivery:</label>
                  <div className="border-b-2 border-gray-300 pb-2 h-8 text-gray-600 flex items-center">
                    <i className="fas fa-calendar text-gray-400 mr-2"></i>
                    [MM/DD/YYYY - Auto-generated]
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Delivery Confirmation */}
            <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center">
                <i className="fab fa-whatsapp text-green-600 text-xl mr-3"></i>
                <div>
                  <p className="font-bold text-green-800 text-sm">WhatsApp Delivery Confirmation</p>
                  <p className="text-green-700 text-xs mt-1">
                    This notice will be delivered via WhatsApp and considered received upon delivery to the registered WhatsApp number.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <div className="inline-flex items-center bg-blue-50 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <i className="fas fa-info-circle mr-2"></i>
            Legal Framework
          </div>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto">
            How Sitter agreements are structured as donation/employment arrangements, not traditional leases. 
            The 5-day Notice to Vacate is standard in all electronic contracts. Sitters sign electronic code 
            of conduct agreements and indemnity bonds to hold harmless the Lister.
          </p>
          <p className="text-gray-500 text-xs mt-4">
            This template is provided for informational purposes. Consult with legal counsel for specific advice.
          </p>
        </div>
      </div>

      {/* Payment Terms Section */}
      <div className="mt-20 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <i className="fas fa-money-check-alt text-green-600 mr-3"></i>
          Payment Terms & Methods
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 text-lg">First Transaction (Required)</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <i className="fab fa-paypal text-blue-500 text-sm"></i>
                </div>
                <div>
                  <span className="text-gray-700 font-medium">PayPal through How Sitter platform</span>
                  <p className="text-gray-600 text-sm">Minimum 50% of booking amount required</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <i className="fas fa-percentage text-green-600 text-sm"></i>
                </div>
                <div>
                  <span className="text-gray-700 font-medium">Commission to How Sitter</span>
                  <p className="text-gray-600 text-sm">Only on first transaction to establish trust</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 text-lg">Subsequent Arrangements (Optional)</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                  <i className="fas fa-money-bill-wave text-green-600 text-sm"></i>
                </div>
                <div>
                  <span className="text-gray-700 font-medium">Cash payments</span>
                  <p className="text-gray-600 text-sm">Preferred for off-book transactions</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <i className="fas fa-mobile-alt text-blue-600 text-sm"></i>
                </div>
                <div>
                  <span className="text-gray-700 font-medium">Digital payments</span>
                  <p className="text-gray-600 text-sm">Pix (Brazil), Zelle (USA), country-specific options</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-start">
            <i className="fas fa-exclamation-triangle text-yellow-500 mt-1 mr-3"></i>
            <div>
              <p className="font-bold text-yellow-800">Important Payment Policy</p>
              <p className="text-yellow-700 text-sm mt-1">
                First transaction must use PayPal through our platform for at least 50% to establish trust. 
                Subsequent arrangements can use off-book methods. Goal: No paper trail, completely off the books.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Support Section */}
      <div className="mt-16 text-center">
        <div className="bg-gradient-to-r from-green-50 to-white rounded-2xl p-8 border border-green-200">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-600 flex items-center justify-center">
            <i className="fab fa-whatsapp text-white text-2xl"></i>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Legal Questions?</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Our WhatsApp support team can help you understand our legal framework and agreements.
          </p>
          <a 
            href="https://wa.me/6588888888"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3.5 rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
          >
            <i className="fab fa-whatsapp mr-2"></i>
            WhatsApp Legal Support
          </a>
          <p className="text-gray-500 text-sm mt-4">
            Available 8AM–5PM daily • Connect for legal agreement questions
          </p>
        </div>
      </div>
    </div>
  );
};