import { useState, useEffect } from "react";
import { User, LogOut, Settings, LogIn, Lock, Mail, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

export function UserMenu() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  
  // Dialog Open states
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  // Auth Form States
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Profile Form States
  const [editFullName, setEditFullName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Monitor Auth Status
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error) throw error;
      if (data) {
        setProfile(data);
        setEditFullName(data.full_name ?? "");
        setEditUsername(data.username ?? "");
        setEditAvatarUrl(data.avatar_url ?? "");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Silakan isi semua kolom!");
      return;
    }
    
    setAuthLoading(true);
    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || email.split("@")[0],
              username: username || email.split("@")[0],
              avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(email)}`,
            },
          },
        });
        if (error) throw error;
        toast.success("Registrasi berhasil! Silakan cek email Anda untuk konfirmasi.");
        setAuthOpen(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Berhasil masuk!");
        setAuthOpen(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan!");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Berhasil keluar.");
    } catch (err: any) {
      toast.error(err.message || "Gagal keluar.");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setProfileLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: editFullName,
          username: editUsername,
          avatar_url: editAvatarUrl,
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      toast.success("Profil berhasil diperbarui!");
      fetchProfile(user.id);
      setProfileOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui profil.");
    } finally {
      setProfileLoading(false);
    }
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const hasMissingCredentials = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (hasMissingCredentials) {
    return (
      <Button
        variant="outline"
        onClick={() => toast.error("Supabase credentials are not set up in environment variables yet.")}
        className="rounded-full gap-2 border-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300"
      >
        <ShieldAlert className="h-4 w-4" />
        Configure Auth
      </Button>
    );
  }

  return (
    <>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:opacity-85 focus:outline-none transition-all">
              <Avatar className="h-9 w-9 border border-primary/20 shadow-[var(--shadow-soft)]">
                <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "User"} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start text-left">
                <span className="text-sm font-semibold text-foreground line-clamp-1">
                  {profile?.full_name || user.email.split("@")[0]}
                </span>
                <span className="text-xs text-muted-foreground line-clamp-1">
                  @{profile?.username || user.email.split("@")[0]}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-2xl shadow-[var(--shadow-card)] border border-border p-1.5">
            <DropdownMenuLabel className="px-2.5 py-2 text-xs font-normal text-muted-foreground">
              Akun Saya
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem
              onClick={() => setProfileOpen(true)}
              className="rounded-xl px-2.5 py-2 text-sm text-foreground focus:bg-secondary flex items-center gap-2 cursor-pointer"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              Ubah Profil
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="rounded-xl px-2.5 py-2 text-sm text-destructive focus:bg-destructive/10 flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button onClick={() => setAuthOpen(true)} className="rounded-full shadow-[var(--shadow-soft)] gap-2">
          <LogIn className="h-4 w-4" />
          Masuk / Daftar
        </Button>
      )}

      {/* Authentication Dialog (Login / Register) */}
      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight text-center">
              {isRegister ? "Buat Akun Baru" : "Masuk ke CycleTrack"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAuth} className="space-y-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="email">Alamat Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {isRegister && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nama Lengkap</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Luna Clarissa"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="lunaclara"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full mt-4" disabled={authLoading}>
              {authLoading ? "Memproses..." : isRegister ? "Daftar Akun" : "Masuk"}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground mt-2">
            {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-primary hover:underline font-semibold focus:outline-none"
            >
              {isRegister ? "Masuk di sini" : "Daftar di sini"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">Ubah Profil Anda</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdateProfile} className="space-y-4 py-3">
            <div className="flex flex-col items-center gap-4 mb-4">
              <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-md">
                <AvatarImage src={editAvatarUrl} />
                <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="space-y-1.5 w-full">
                <Label htmlFor="avatarUrl">URL Gambar Profil (Avatar)</Label>
                <Input
                  id="avatarUrl"
                  type="text"
                  placeholder="https://api.dicebear.com/..."
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setEditAvatarUrl(`https://api.dicebear.com/7.x/adventurer/svg?seed=${Date.now()}`)}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Acak Avatar 🎲
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editFullName">Nama Lengkap</Label>
              <Input
                id="editFullName"
                type="text"
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editUsername">Username</Label>
              <Input
                id="editUsername"
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setProfileOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={profileLoading}>
                {profileLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
