'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function OpenSourceRedirect() {
  useEffect(() => {
    redirect('/security');
  }, []);

  return null;
}
