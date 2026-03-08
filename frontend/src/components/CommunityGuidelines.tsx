import React from 'react';
import { FaUsers, FaComments, FaHandshake, FaExclamationTriangle } from 'react-icons/fa';

const CommunityGuidelines = () => {
  const principles = [
    {
      icon: <FaHandshake className="text-3xl text-green-600" />,
      title: 'Mutual Respect',
      description: 'Treat all community members with respect and consideration.',
      rules: [
        'Use respectful language in all communications',
        'Be punctual for video calls and arrangements',
        'Respect cultural differences and boundaries'
      ]
    },
    {
      icon: <FaComments className="text-3xl text-yellow-600" />,
      title: 'Clear Communication',
      description: 'Maintain open, honest, and timely communication.',
      rules: [
        'Respond to messages within 24 hours',
        'Be transparent about availability and expectations',
        'Use WhatsApp for ongoing communication'
      ]
    },
    {
      icon: <FaUsers className="text-3xl text-blue-600" />,
      title: 'Community First',
      description: 'Prioritize the well-being of our community.',
      rules: [
        'Leave honest reviews after arrangements',
        'Report any suspicious activity immediately',
        'Support fellow community members'
      ]
    },
    {
      icon: <FaExclamationTriangle className="text-3xl text-red-600" />,
      title: 'Zero Tolerance',
      description: 'Policies that ensure community safety.',
      rules: [
        'No discrimination or harassment',
        'No fraudulent activity or misrepresentation',
        'No unauthorized guests or subletting'
      ]
    }
  ];

  const consequences = [
    {
      level: 'Minor Violation',
      actions: ['Warning', 'Required education', 'Temporary restrictions'],
      examples: 'Late responses, minor miscommunication'
    },
    {
      level: 'Moderate Violation',
      actions: ['Temporary suspension', 'Mandatory mediation', 'Review removal'],
      examples: 'Cancellation without notice, property damage'
    },
    {
      level: 'Severe Violation',
      actions: ['Permanent ban', 'Legal action', 'Platform-wide notification'],
      examples: 'Fraud, harassment, safety violations'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Community Guidelines
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            These guidelines ensure a safe, respectful, and trustworthy environment for all How Sitter members.
          </p>
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {principles.map((principle, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  {principle.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {principle.title}
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                {principle.description}
              </p>
              <ul className="space-y-2">
                {principle.rules.map((rule, ruleIndex) => (
                  <li key={ruleIndex} className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                    <span className="ml-3 text-gray-700">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Consequences */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Enforcement & Consequences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {consequences.map((consequence, index) => (
              <div key={index} className={`border-2 rounded-xl p-6 ${
                index === 0 ? 'border-yellow-200 bg-yellow-50' :
                index === 1 ? 'border-orange-200 bg-orange-50' :
                'border-red-200 bg-red-50'
              }`}>
                <h3 className={`text-lg font-bold mb-3 ${
                  index === 0 ? 'text-yellow-800' :
                  index === 1 ? 'text-orange-800' :
                  'text-red-800'
                }`}>
                  {consequence.level}
                </h3>
                <ul className="space-y-2 mb-4">
                  {consequence.actions.map((action, actionIndex) => (
                    <li key={actionIndex} className="flex items-start">
                      <span className={`mr-2 ${
                        index === 0 ? 'text-yellow-600' :
                        index === 1 ? 'text-orange-600' :
                        'text-red-600'
                      }`}>•</span>
                      <span className="text-gray-700">{action}</span>
                    </li>
                  ))}
                </ul>
                <div className={`text-sm ${
                  index === 0 ? 'text-yellow-700' :
                  index === 1 ? 'text-orange-700' :
                  'text-red-700'
                }`}>
                  Examples: {consequence.examples}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agreement Section */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4 text-center">
            Our Community Commitment
          </h2>
          <p className="text-center text-xl mb-8 max-w-3xl mx-auto">
            By joining How Sitter, you agree to uphold these guidelines and contribute to building a global community based on trust and mutual respect.
          </p>
          
          <div className="bg-white bg-opacity-20 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Reporting Violations</h3>
            <p className="mb-4">
              If you encounter behavior that violates our guidelines, please report it immediately through:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="font-bold">Platform</div>
                <div>Report button on user profiles</div>
              </div>
              <div className="text-center">
                <div className="font-bold">Email</div>
                <div>safety@howsitter.com</div>
              </div>
              <div className="text-center">
                <div className="font-bold">Support</div>
                <div>Help center live chat</div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg mb-4">
              Together, we can maintain a safe and welcoming community for everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300">
                Read Full Terms
              </button>
              <button className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-300">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityGuidelines;