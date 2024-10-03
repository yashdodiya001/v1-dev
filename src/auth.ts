import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    GitHub({
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name,
          email: profile.email,
          imageUrl: profile.avatar_url,
          username: profile.login,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.imageUrl = user.imageUrl;
        token.username = user.username;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.imageUrl = token.imageUrl as string;
      session.user.username = token.username as string;
      return session;
    },
    // signIn method to store details in a database
    async signIn({ user, account, profile }) {
      try {
        const response = await fetch(
          "https://api.v1vue.miraiminds.co/v1/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              githubId: user.id,
              name: user.name,
              email: user.email,
              imageUrl: user.imageUrl,
              username: user.username,
            }),
          }
        );

        if (!response.ok) {
          console.error("Failed to send user data to backend");
          return false;
        }

        const data = await response.json();
        if (data.data.mongoId) {
          user.id = data.data.mongoId; // Update the user.id with MongoDB _id
        }

        return true;
      } catch (error) {
        console.error("Error sending user data to backend:", error);
        return false;
      }
    },
  },
});

// import NextAuth from "next-auth";
// import GitHub from "next-auth/providers/github";

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   // Remove the adapter configuration
//   session: {
//     strategy: "jwt",
//   },
//   providers: [
//     GitHub({
//       clientId: process.env.GITHUB_ID,
//       clientSecret: process.env.GITHUB_SECRET,
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, account, profile }) {
//       // Custom logic to handle JWT creation
//       if (account && profile) {
//         // Make a request to your custom backend here
//         const response = await fetch('YOUR_BACKEND_URL/auth/github', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             accessToken: account.access_token,
//             profile: {
//               id: profile.id,
//               name: profile.name,
//               email: profile.email,
//               avatar_url: profile.avatar_url,
//               login: profile.login,
//             },
//           }),
//         });

//         const userData = await response.json();

//         // Update token with user data from your backend
//         token.id = userData.id;
//         token.imageUrl = userData.imageUrl;
//         token.username = userData.username;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       // Update session with user data from the token
//       session.user.id = token.id as string;
//       session.user.imageUrl = token.imageUrl as string;
//       session.user.username = token.username as string;
//       return session;
//     },
//   },
// });
