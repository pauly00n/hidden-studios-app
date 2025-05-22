import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { ProfileForm } from '@/components/profile-form';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    console.log("no profile")
    await supabase.from('profiles').insert([
      { id: user.id, display_name: '', bio: '' }
    ]);
  }

  const { data: finalProfile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error(error);
    return <div>{error.message}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-2">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
      </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Your email: {user.email}
            </p>
          </div>

          <div>
            <ProfileForm
              initialDisplayName={finalProfile.display_name}
              initialBio={finalProfile.bio}
            />
          </div>
        </div>
    </div>
  );
}