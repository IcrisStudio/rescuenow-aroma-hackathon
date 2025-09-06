"use client"
import { useUser } from '@clerk/nextjs';
import React, { use } from 'react'

const page = () => {
    const { user } = useUser();
  return (
    user ? <div>Welcome, {user.firstName}!</div> : <div>Please sign in.</div>
  )
}

export default page