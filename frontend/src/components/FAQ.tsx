import React, { useState } from 'react';
import { FAQS } from '../constants';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div id="faq" className="max-w-4xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-dark mb-4">Frequently Asked Questions</h2>
        <p className="text-lg text-gray max-w-2xl mx-auto">
          Everything you need to know about trust-based house sitting
        </p>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, idx) => (
          <div key={idx} className="border border-border rounded-2xl overflow-hidden bg-white">
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex justify-between items-center p-8 hover:bg-light-gray transition-colors"
            >
              <div className="flex items-start text-left">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                  <span className="text-primary font-bold">{idx + 1}</span>
                </div>
                <span className="font-bold text-dark text-lg">{faq.question}</span>
              </div>
              <i className={`fas fa-chevron-down transition-transform duration-300 text-gray ${openIndex === idx ? 'rotate-180' : ''}`}></i>
            </button>
            <div className={`transition-all duration-300 overflow-hidden ${openIndex === idx ? 'max-h-96' : 'max-h-0'}`}>
              <div className="p-8 pt-0">
                <div className="pl-12 border-l-2 border-primary">
                  <p className="text-gray leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="mt-20 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white mb-6">
          <i className="fas fa-comments text-2xl"></i>
        </div>
        <h3 className="text-3xl font-bold text-dark mb-4">Still have questions?</h3>
        <p className="text-gray mb-8 max-w-md mx-auto">
          Our support team is here to help you with any questions about house sitting arrangements.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="https://wa.me/6588888888"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white px-8 py-3.5 rounded-full font-bold hover:bg-green-600 transition-colors inline-flex items-center justify-center gap-2"
          >
            <i className="fab fa-whatsapp"></i>
            WhatsApp Support
          </a>
          <button className="bg-white text-dark border-2 border-border px-8 py-3.5 rounded-full font-bold hover:border-primary transition-colors">
            Email Support
          </button>
        </div>
        <p className="text-gray text-sm mt-6">
          Available 8AM–10PM daily • Average response time: 5 minutes
        </p>
      </div>
    </div>
  );
};