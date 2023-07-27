import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ResetPassword() {
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.onAuthStateChange(async (event, _session) => {
      if (event == "PASSWORD_RECOVERY") {
        const newPassword = prompt(
          "What would you like your new password to be?"
        );
        if (!supabase || !newPassword) return;
        const { data, error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (data) {
          alert("Password updated successfully!");
          // redirect to home page
          window.location.href = "/";
        }
        if (error) alert("There was an error updating your password.");
      }
    });
  }, []);
  return null;
}
