import React from 'react';
import { 
  FaShieldAlt, FaUserCheck, FaFileContract, 
  FaLock, FaVideo, FaHandshake 
} from 'react-icons/fa';

const TrustSafety = () => {
  const safetyFeatures = [
    {
      icon: <FaUserCheck className="text-3xl text-green-600" />,
      title: 'Verified Identity',
      description: 'All users undergo ID verification and background checks before participating in arrangements.',
      details: ['Government ID verification', 'Background screening', 'Manual profile review']
    },
    {
      icon: <FaVideo className="text-3xl text-yellow-600" />,
      title: 'Mandatory Discovery Calls',
      description: 'Video calls are required before any arrangement to ensure compatibility and build trust.',
      details: ['Face-to-face introduction', 'Property walkthrough', 'Expectation alignment']
    },
    {
      icon: <FaFileContract className="text-3xl text-blue-600" />,
      title: 'Legal Framework',
      description: 'Comprehensive electronic agreements with clear terms and conditions for both parties.',
      details: ['5-day notice period', 'Clear responsibilities', 'Dispute resolution process']
    },
    {
      icon: <FaLock className="text-3xl text-green-700" />,
      title: 'Secure Payments',
      description: 'PayPal-secured payments with escrow-like protection for security deposits.',
      details: ['PayPal business accounts only', 'Payment tracking', 'Refund protection']
    },
    {
      icon: <FaShieldAlt className="text-3xl text-yellow-700" />,
      title: 'Property Protection',
      description: 'Comprehensive insurance guidance and security measures for all properties.',
      details: ['Insurance verification', 'Emergency protocols', 'Property documentation']
    },
    {
      icon: <FaHandshake className="text-3xl text-blue-700" />,
      title: 'Community Support',
      description: '24/7 support and active community moderation to ensure safe experiences.',
      details: ['Dedicated support team', 'Community guidelines', 'User reviews system']
    }
  ];

  const stats = [
    { label: 'Verified Users', value: '10,000+' },
    { label: 'Successful Arrangements', value: '5,000+' },
    { label: 'Countries Covered', value: '50+' },
    { label: 'Response Rate', value: '99%' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4">
            <FaShieldAlt className="text-3xl text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Trust & Safety
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your security is our top priority. Discover how we build trust in every house sitting arrangement.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Safety Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {safetyFeatures.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {feature.description}
              </p>
              <ul className="space-y-2">
                {feature.details.map((detail, detailIndex) => (
                  <li key={detailIndex} className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                    <span className="ml-3 text-gray-700">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Verification Process */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 text-white mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Our Verification Process
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">1</div>
              <h4 className="text-xl font-semibold mb-2">Profile Creation</h4>
              <p>Complete your profile with real information and photos</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">2</div>
              <h4 className="text-xl font-semibold mb-2">ID Verification</h4>
              <p>Submit government-issued ID for manual review</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">3</div>
              <h4 className="text-xl font-semibold mb-2">Background Check</h4>
              <p>Comprehensive screening for safety and trust</p>
            </div>
          </div>
        </div>

        {/* Safety Tips */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Safety Tips for All Users
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3">
                  ✓
                </div>
                For Homeowners
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Always conduct video calls before arrangements
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Document your property condition before departure
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Provide clear written instructions for your home
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Verify sitter's previous experience and reviews
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mr-3">
                  ✓
                </div>
                For Sitters
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  Ask detailed questions about responsibilities
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  Request virtual tour of the property
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  Clarify emergency contact procedures
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  Understand house rules and expectations
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustSafety;