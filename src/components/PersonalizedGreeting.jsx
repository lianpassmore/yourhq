import React, { useEffect, useState } from 'react';

export default function PersonalizedGreeting({ packageName, fallbackGreeting }) {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const name = params.get('name') || params.get('customer_name') || '';
      setUserName(name);
    }
  }, []);

  if (!userName) {
    return <span>{fallbackGreeting || 'Payment Confirmed!'}</span>;
  }

  return (
    <span>
      Welcome, {userName}!
    </span>
  );
}
