import React, { useState } from 'react';
import { FAQS } from '../constants';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Enhanced FAQ data aligned with How Sitter concept
  const howSitterFAQS = [
    {
      question: 'What is How Sitter?',
      answer: 'How Sitter is a trust-based house sitting platform that connects verified house sitters (Sitters) with homeowners (Listers). We offer arrangements of 1 month or longer, focusing on responsible property care rather than short-term rentals. Our name sounds like "house sitter" and answers the question: "how to sit?" or "how do we do it?"'
    },
    {
      question: 'How is How Sitter different from Airbnb?',
      answer: 'Unlike Airbnb which is a short-term rental platform with high fees and taxes, How Sitter creates house sitting arrangements where sitters act as fiduciaries who care for the home. We avoid the overbearing fees and government oversight associated with traditional rental platforms. Sitters sign electronic agreements outlining their responsibilities.'
    },
    {
      question: 'What is Mandatory Discovery for sitters?',
      answer: 'All house sitters must complete Mandatory Discovery verification: 1) Airbnb or VRBO profile for identity verification, 2) Credit rating of 675 or higher, 3) Proof of bank balance showing financial stability, 4) LinkedIn profile may also be required. This ensures trust and security in our community.'
    },
    {
      question: 'What are the minimum stay durations?',
      answer: 'We offer arrangements for 1 month or longer with these options: 1 month, 2-4 months, 3-6 months, 6-11 months, and 1 year or more. All properties are fully furnished - no empty spaces.'
    },
    {
      question: 'How does payment work?',
      answer: 'For the FIRST transaction, sitters must book through our platform using PayPal for at least 50% of the booking amount to establish trust. Subsequent arrangements can use cash, Pix (Brazil), Zelle (USA), or other country-specific options. Our goal is to keep most transactions off-the-books with no paper trail.'
    },
    {
      question: 'What is the 5-Day Notice to Vacate?',
      answer: 'Every electronic contract includes an automatic 5-day Notice to Vacate clause. This allows homeowners to request sitters to vacate within 5 days if needed. Sitters receive this notice electronically and must comply, as they sign an electronic code of conduct agreement.'
    },
    {
      question: 'How does communication work on How Sitter?',
      answer: 'We use WhatsApp for direct communication between sitters and homeowners. Each listing includes a WhatsApp button for direct connection. We also have master WhatsApp customer service available 8AM-5PM, and a How Sitter Global Network WhatsApp group for community information sharing.'
    },
    {
      question: 'What security protocols are in place?',
      answer: 'All users must complete Mandatory Discovery verification. Sitters indemnify both the platform and homeowners through electronic agreements. Bad actors are reported in group chats and added to a public ban list. We maintain a trust-based community with rigorous verification.'
    },
    {
      question: 'Can homeowners evict sitters early?',
      answer: 'Homeowners cannot execute early eviction arbitrarily. The electronic agreement provides a structured 5-day notice process. Homeowners must provide a sufficient clean space and ensure a non-hazardous environment. Both parties are protected by our electronic agreements.'
    },
    {
      question: 'What is How Sitter\'s business model?',
      answer: 'We generate revenue from: 1) Commission on first transactions through PayPal, 2) Limited advertising on the platform, 3) Future premium features. Our exit strategy is to sell the business within 3 years, growing through pre-seed to Series D funding rounds.'
    }
  ];

  return (
    <div id="faq" className="max-w-4xl mx-auto px-4 py-20">
      {/* Brand Header */}
      <div className="flex items-center justify-center mb-8">
        <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center mr-4">
          <i className="fas fa-home text-white text-xl"></i>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">How Sitter</h1>
      </div>

      <div className="text-center mb-16">
        <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
          Trust-Based House Sitting
        </div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Everything you need to know about our novel house sitting arrangement concept
        </p>
      </div>

      {/* Key Features Banner */}
      <div className="mb-12 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
              <i className="fas fa-shield-check text-green-600 text-xl"></i>
            </div>
            <h4 className="font-bold text-gray-900">Mandatory Discovery</h4>
            <p className="text-sm text-gray-600">All sitters verified through Airbnb, credit checks, and financial proof</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-yellow-100 flex items-center justify-center">
              <i className="fab fa-whatsapp text-green-600 text-xl"></i>
            </div>
            <h4 className="font-bold text-gray-900">WhatsApp Network</h4>
            <p className="text-sm text-gray-600">Direct communication & community groups</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
              <i className="fas fa-file-contract text-blue-600 text-xl"></i>
            </div>
            <h4 className="font-bold text-gray-900">Electronic Agreements</h4>
            <p className="text-sm text-gray-600">5-day notice to vacate & indemnity bonds</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {howSitterFAQS.map((faq, idx) => (
          <div key={idx} className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-md transition-shadow">
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex justify-between items-center p-8 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start text-left">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-4">
                  <span className="text-green-700 font-bold">{idx + 1}</span>
                </div>
                <span className="font-bold text-gray-900 text-lg">{faq.question}</span>
              </div>
              <i className={`fas fa-chevron-down transition-transform duration-300 text-gray-500 ${openIndex === idx ? 'rotate-180' : ''}`}></i>
            </button>
            <div className={`transition-all duration-300 overflow-hidden ${openIndex === idx ? 'max-h-96' : 'max-h-0'}`}>
              <div className="p-8 pt-0">
                <div className="pl-12 border-l-2 border-green-600">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="mt-20 bg-gradient-to-r from-green-50 via-yellow-50 to-blue-50 rounded-2xl p-12 text-center border-2 border-green-200">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-600 text-white flex items-center justify-center">
            <i className="fab fa-whatsapp text-2xl"></i>
          </div>
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-4">Still have questions?</h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Our WhatsApp support team is here to help you with any questions about house sitting arrangements.
          Available 8AM–5PM daily • Average response time: 5 minutes
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="https://wa.me/6588888888"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white px-8 py-3.5 rounded-full font-bold hover:bg-green-700 transition-colors inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <i className="fab fa-whatsapp"></i>
            WhatsApp Customer Service
          </a>
          <a 
            href="https://chat.whatsapp.com/how-sitter-global"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-8 py-3.5 rounded-full font-bold hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <i className="fab fa-whatsapp"></i>
            How Sitter Global Network
          </a>
        </div>
        <p className="text-gray-500 text-sm mt-6">
          Master WhatsApp: +65 8888 8888 • Join our community groups for trusted information
        </p>
      </div>

      {/* Brand Values Footer */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="text-center">
          <p className="text-gray-600 mb-4">How Sitter - Democratizing House Sitting</p>
          <div className="flex justify-center items-center space-x-6">
            <span className="text-sm text-gray-500 flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-600 mr-2"></span>
              Green: Trust & Growth
            </span>
            <span className="text-sm text-gray-500 flex items-center">
              <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
              Yellow: Brazilian Heritage
            </span>
            <span className="text-sm text-gray-500 flex items-center">
              <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
              Blue: Professionalism
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};