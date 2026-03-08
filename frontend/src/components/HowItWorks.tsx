import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaHome, FaUserCheck, FaHandshake, FaCalendarCheck, 
  FaShieldAlt, FaComments, FaFileContract 
} from 'react-icons/fa';

const HowItWorks = () => {
  const steps = [
    {
      icon: <FaHome className="text-4xl text-green-600" />,
      title: 'List or Find a Property',
      description: 'Homeowners list properties with 1-month minimum stays. Sitters browse verified properties worldwide.',
      color: 'bg-green-50 border-green-200'
    },
    {
      icon: <FaUserCheck className="text-4xl text-yellow-600" />,
      title: 'Discovery Process',
      description: 'Mandatory video call between homeowner and sitter. Verify identity, discuss expectations, and build trust.',
      color: 'bg-yellow-50 border-yellow-200'
    },
    {
      icon: <FaFileContract className="text-4xl text-blue-600" />,
      title: 'Electronic Agreement',
      description: 'Sign comprehensive house sitting agreement with 5-day notice period for changes.',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      icon: <FaShieldAlt className="text-4xl text-green-700" />,
      title: 'Security & Verification',
      description: 'Background checks, ID verification, and secure payment through PayPal.',
      color: 'bg-green-100 border-green-300'
    },
    {
      icon: <FaComments className="text-4xl text-yellow-700" />,
      title: 'WhatsApp Communication',
      description: 'Direct communication via WhatsApp for seamless coordination.',
      color: 'bg-yellow-100 border-yellow-300'
    },
    {
      icon: <FaHandshake className="text-4xl text-blue-700" />,
      title: 'Start House Sitting',
      description: 'Begin your arrangement with confidence and ongoing support from How Sitter.',
      color: 'bg-blue-100 border-blue-300'
    }
  ];

  const benefits = [
    {
      title: 'For Homeowners',
      items: [
        'Peace of mind with verified sitters',
        'Property security while traveling',
        'No rental income tax implications',
        'Cost-effective house sitting',
        'Global network of reliable sitters'
      ],
      color: 'from-green-500 to-green-700'
    },
    {
      title: 'For Sitters',
      items: [
        'Free accommodation worldwide',
        'Cultural immersion opportunities',
        'No rental payments',
        'Verified safe properties',
        'Build international references'
      ],
      color: 'from-yellow-500 to-yellow-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            How How Sitter Works
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A trust-based house sitting community connecting verified homeowners with reliable sitters worldwide
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`${step.color} border-2 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300`}
            >
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  {step.icon}
                </div>
                <div className="bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-8">
              <div className={`bg-gradient-to-r ${benefit.color} text-white rounded-lg p-4 mb-6`}>
                <h3 className="text-2xl font-bold">{benefit.title}</h3>
              </div>
              <ul className="space-y-4">
                {benefit.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        ✓
                      </div>
                    </div>
                    <span className="ml-3 text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-500 via-yellow-500 to-blue-500 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Experience the freedom of house sitting with the security of a verified platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register?role=homeowner"
              className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300"
            >
              List Your Property
            </Link>
            <Link
              to="/register?role=sitter"
              className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-300"
            >
              Become a Sitter
            </Link>
          </div>
        </div>

        {/* FAQ Preview */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Common Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              'Is there a minimum stay requirement?',
              'How does the verification process work?',
              'What happens if there are issues during the stay?',
              'Can I cancel an arrangement?'
            ].map((question, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">{question}</h4>
                <Link 
                  to="/faq" 
                  className="text-green-600 hover:text-green-700 font-medium inline-flex items-center"
                >
                  Learn more
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;