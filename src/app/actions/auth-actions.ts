'use server';

import { createClient } from '@/lib/server';
import { redirect } from 'next/navigation';

export async function signInWithGoogle() {
    const supabase =  await createClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`,
        },
    });

    if (error) {
        console.error('Error signing in with Google:', error.message);
        redirect('/error?message=' + error.message);
    }

    // Supabase will return an auth URL to redirect the user to Google's login page
    if (data.url) {
        redirect(data.url);
    }
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/auth/login'); 
}

export async function getUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}