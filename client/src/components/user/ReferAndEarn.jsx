// import { useState } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import {
//   Users,
//   Copy,
//   Share2,
//   Mail,
//   Facebook,
//   Twitter,
//   Linkedin,
//   PhoneIcon as WhatsApp,
//   Gift,
//   CheckCircle,
// } from "lucide-react"

// const ReferEarnComponent = () => {
//   const [email, setEmail] = useState("")
//   const [activeTab, setActiveTab] = useState("overview")

//   // In a real app, we would fetch the referrals data and use mutations
//   // const { data: referrals, isLoading } = useGetReferralsQuery();
//   // const [sendReferral, { isLoading: isSending }] = useSendReferralMutation();

//   // Mock data for demonstration
//   const referrals = {
//     code: "REF-JOHN25",
//     totalEarned: 75.0,
//     pendingEarned: 25.0,
//     referralLink: "https://acme-store.com/ref/REF-JOHN25",
//     rewards: {
//       referrerReward: "$25 store credit",
//       refereeReward: "15% off first purchase",
//     },
//     history: [
//       {
//         id: "REF-001",
//         name: "Emma Thompson",
//         email: "emma.t@example.com",
//         status: "completed",
//         date: "2023-06-01T14:30:00Z",
//         reward: 25.0,
//       },
//       {
//         id: "REF-002",
//         name: "Michael Brown",
//         email: "michael.b@example.com",
//         status: "completed",
//         date: "2023-05-15T09:45:00Z",
//         reward: 25.0,
//       },
//       {
//         id: "REF-003",
//         name: "Sophia Wilson",
//         email: "sophia.w@example.com",
//         status: "completed",
//         date: "2023-04-22T16:20:00Z",
//         reward: 25.0,
//       },
//       {
//         id: "REF-004",
//         name: "James Davis",
//         email: "james.d@example.com",
//         status: "pending",
//         date: "2023-06-10T11:15:00Z",
//         reward: 25.0,
//       },
//     ],
//   }

//   const handleSendReferral = (e) => {
//     e.preventDefault()
//     if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
//       return
//     }

//     // In a real app, we would call the mutation
//     // sendReferral({ email });

//     alert(`Referral invitation sent to ${email}`)
//     setEmail("")
//   }

//   const handleCopyReferralLink = () => {
//     navigator.clipboard.writeText(referrals.referralLink)
//     alert("Referral link copied to clipboard!")
//   }

//   const handleShareReferral = (platform) => {
//     // In a real app, we would implement sharing functionality
//     alert(`Sharing referral link via ${platform}`)
//   }

//   return (
//     <div className="space-y-6">
//       <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
//         <TabsList className="grid w-full grid-cols-2">
//           <TabsTrigger value="overview">Program Overview</TabsTrigger>
//           <TabsTrigger value="history">Referral History</TabsTrigger>
//         </TabsList>

//         <TabsContent value="overview" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-2xl font-bold text-primary">Refer & Earn</CardTitle>
//               <CardDescription>Invite friends and earn rewards when they shop</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <Card className="bg-muted/30">
//                   <CardContent className="p-6 flex flex-col items-center text-center">
//                     <Users className="h-10 w-10 text-primary mb-4" />
//                     <h3 className="font-medium">Step 1</h3>
//                     <p className="text-sm text-muted-foreground">Share your unique referral link with friends</p>
//                   </CardContent>
//                 </Card>
//                 <Card className="bg-muted/30">
//                   <CardContent className="p-6 flex flex-col items-center text-center">
//                     <Gift className="h-10 w-10 text-primary mb-4" />
//                     <h3 className="font-medium">Step 2</h3>
//                     <p className="text-sm text-muted-foreground">Your friend makes a purchase using your link</p>
//                   </CardContent>
//                 </Card>
//                 <Card className="bg-muted/30">
//                   <CardContent className="p-6 flex flex-col items-center text-center">
//                     <CheckCircle className="h-10 w-10 text-primary mb-4" />
//                     <h3 className="font-medium">Step 3</h3>
//                     <p className="text-sm text-muted-foreground">Both you and your friend receive rewards</p>
//                   </CardContent>
//                 </Card>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="text-lg font-medium text-primary">Your Rewards</CardTitle>
//                   </CardHeader>
//                   <CardContent className="space-y-4">
//                     <div className="flex justify-between items-center">
//                       <span className="text-muted-foreground">Total Earned</span>
//                       <span className="font-bold text-xl">${referrals.totalEarned.toFixed(2)}</span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-muted-foreground">Pending Rewards</span>
//                       <span className="font-medium">${referrals.pendingEarned.toFixed(2)}</span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-muted-foreground">You Get</span>
//                       <span className="font-medium">{referrals.rewards.referrerReward}</span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-muted-foreground">Friend Gets</span>
//                       <span className="font-medium">{referrals.rewards.refereeReward}</span>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 <Card>
//                   <CardHeader>
//                     <CardTitle className="text-lg font-medium text-primary">Your Referral Code</CardTitle>
//                   </CardHeader>
//                   <CardContent className="space-y-4">
//                     <div className="flex items-center gap-2">
//                       <div className="bg-muted px-3 py-2 rounded-md font-mono text-sm flex-1 text-center">
//                         {referrals.code}
//                       </div>
//                       <Button
//                         variant="outline"
//                         size="icon"
//                         onClick={() => navigator.clipboard.writeText(referrals.code)}
//                         title="Copy code"
//                       >
//                         <Copy className="h-4 w-4" />
//                       </Button>
//                     </div>

//                     <div className="space-y-2">
//                       <Label htmlFor="referral-link">Your Referral Link</Label>
//                       <div className="flex">
//                         <Input id="referral-link" value={referrals.referralLink} readOnly className="rounded-r-none" />
//                         <Button
//                           onClick={handleCopyReferralLink}
//                           className="bg-primary hover:bg-primary/90 rounded-l-none"
//                         >
//                           <Copy className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>

//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-lg font-medium text-primary">Share Your Referral</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-6">
//                   <div className="flex flex-wrap gap-2 justify-center">
//                     <Button
//                       variant="outline"
//                       className="flex items-center gap-2"
//                       onClick={() => handleShareReferral("Email")}
//                     >
//                       <Mail className="h-4 w-4" />
//                       Email
//                     </Button>
//                     <Button
//                       variant="outline"
//                       className="flex items-center gap-2"
//                       onClick={() => handleShareReferral("Facebook")}
//                     >
//                       <Facebook className="h-4 w-4" />
//                       Facebook
//                     </Button>
//                     <Button
//                       variant="outline"
//                       className="flex items-center gap-2"
//                       onClick={() => handleShareReferral("Twitter")}
//                     >
//                       <Twitter className="h-4 w-4" />
//                       Twitter
//                     </Button>
//                     <Button
//                       variant="outline"
//                       className="flex items-center gap-2"
//                       onClick={() => handleShareReferral("LinkedIn")}
//                     >
//                       <Linkedin className="h-4 w-4" />
//                       LinkedIn
//                     </Button>
//                     <Button
//                       variant="outline"
//                       className="flex items-center gap-2"
//                       onClick={() => handleShareReferral("WhatsApp")}
//                     >
//                       <WhatsApp className="h-4 w-4" />
//                       WhatsApp
//                     </Button>
//                   </div>

//                   <div className="border-t pt-6">
//                     <form onSubmit={handleSendReferral}>
//                       <div className="space-y-2">
//                         <Label htmlFor="friend-email">Invite via Email</Label>
//                         <div className="flex">
//                           <Input
//                             id="friend-email"
//                             type="email"
//                             placeholder="friend@example.com"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             className="rounded-r-none"
//                           />
//                           <Button
//                             type="submit"
//                             className="bg-primary hover:bg-primary/90 rounded-l-none"
//                             disabled={!email.trim() || !/\S+@\S+\.\S+/.test(email)}
//                           >
//                             <Share2 className="h-4 w-4 mr-2" />
//                             Send
//                           </Button>
//                         </div>
//                       </div>
//                     </form>
//                   </div>
//                 </CardContent>
//               </Card>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="history">
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-2xl font-bold text-primary">Referral History</CardTitle>
//               <CardDescription>Track all your referrals and rewards</CardDescription>
//             </CardHeader>
//             <CardContent>
//               {referrals.history.length === 0 ? (
//                 <div className="text-center py-8">
//                   <Users className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
//                   <h3 className="text-lg font-medium">No referrals yet</h3>
//                   <p className="text-muted-foreground">Start sharing your referral link to earn rewards.</p>
//                   <Button className="mt-4 bg-primary hover:bg-primary/90" onClick={() => setActiveTab("overview")}>
//                     Start Referring
//                   </Button>
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Name</TableHead>
//                         <TableHead>Email</TableHead>
//                         <TableHead>Date</TableHead>
//                         <TableHead>Status</TableHead>
//                         <TableHead className="text-right">Reward</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {referrals.history.map((referral) => (
//                         <TableRow key={referral.id}>
//                           <TableCell className="font-medium">{referral.name}</TableCell>
//                           <TableCell>{referral.email}</TableCell>
//                           <TableCell>{new Date(referral.date).toLocaleDateString()}</TableCell>
//                           <TableCell>
//                             {referral.status === "completed" ? (
//                               <span className="flex items-center gap-1 text-green-600">
//                                 <CheckCircle className="h-4 w-4" />
//                                 Completed
//                               </span>
//                             ) : (
//                               <span className="flex items-center gap-1 text-amber-600">
//                                 <Gift className="h-4 w-4" />
//                                 Pending
//                               </span>
//                             )}
//                           </TableCell>
//                           <TableCell className="text-right">
//                             {referral.status === "completed" ? (
//                               <span className="font-medium">${referral.reward.toFixed(2)}</span>
//                             ) : (
//                               <span className="text-muted-foreground">--</span>
//                             )}
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }

// export default ReferEarnComponent




// import { useState } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import {
//   Users,
//   Copy,
//   Share2,
//   Mail,
//   Facebook,
//   Twitter,
//   Linkedin,
//   PhoneIcon as WhatsApp,
//   Gift,
//   CheckCircle,
// } from "lucide-react";
// import { useGetReferralsQuery, useSendReferralMutation } from "@/store/api/userApiSlice";
// import { Alert, AlertDescription } from "@/components/ui/alert";

// const ReferEarnComponent = () => {
//   const [email, setEmail] = useState("");
//   const [activeTab, setActiveTab] = useState("overview");
//   const [error, setError] = useState("");

//   const { data, isLoading, error: fetchError } = useGetReferralsQuery();
//   const [sendReferral, { isLoading: isSending }] = useSendReferralMutation();

//   const referrals = data?.referrals || {
//     code: "",
//     totalEarned: 0,
//     pendingEarned: 0,
//     referralLink: "",
//     rewards: {
//       referrerReward: "₹500 wallet credit",
//       refereeReward: "10% off first purchase",
//     },
//     history: [],
//   };

//   const handleSendReferral = async (e) => {
//     e.preventDefault();
//     if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
//       setError("Please enter a valid email address");
//       return;
//     }

//     setError("");
//     try {
//       await sendReferral({ email }).unwrap();
//       alert(`Referral invitation sent to ${email}`);
//       setEmail("");
//     } catch (err) {
//       setError(err.data?.message || "Failed to send referral invitation");
//     }
//   };

//   const handleCopyReferralLink = () => {
//     navigator.clipboard.writeText(referrals.referralLink);
//     alert("Referral link copied to clipboard!");
//   };

//   const handleCopyReferralCode = () => {
//     navigator.clipboard.writeText(referrals.code);
//     alert("Referral code copied to clipboard!");
//   };

//   const handleShareReferral = (platform) => {
//     const shareUrls = {
//       Email: `mailto:?subject=Join our store&body=Sign up with my referral link to get 10% off your first purchase: ${referrals.referralLink}`,
//       Facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referrals.referralLink)}`,
//       Twitter: `https://twitter.com/intent/tweet?text=Join our store and get 10% off your first purchase!&url=${encodeURIComponent(referrals.referralLink)}`,
//       LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referrals.referralLink)}`,
//       WhatsApp: `https://api.whatsapp.com/send?text=Join our store and get 10% off your first purchase: ${referrals.referralLink}`,
//     };

//     window.open(shareUrls[platform], "_blank");
//   };

//   return (
//     <div className="space-y-6">
//       {fetchError && (
//         <Alert variant="destructive">
//           <AlertDescription>{fetchError.data?.message || "Failed to load referral details"}</AlertDescription>
//         </Alert>
//       )}
//       <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
//         <TabsList className="grid w-full grid-cols-2">
//           <TabsTrigger value="overview">Program Overview</TabsTrigger>
//           <TabsTrigger value="history">Referral History</TabsTrigger>
//         </TabsList>

//         <TabsContent value="overview" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-2xl font-bold text-primary">Refer & Earn</CardTitle>
//               <CardDescription>Invite friends and earn rewards when they shop</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {isLoading ? (
//                 <div className="text-center py-8">Loading...</div>
//               ) : (
//                 <>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                     <Card className="bg-muted/30">
//                       <CardContent className="p-6 flex flex-col items-center text-center">
//                         <Users className="h-10 w-10 text-primary mb-4" />
//                         <h3 className="font-medium">Step 1</h3>
//                         <p className="text-sm text-muted-foreground">Share your unique referral link with friends</p>
//                       </CardContent>
//                     </Card>
//                     <Card className="bg-muted/30">
//                       <CardContent className="p-6 flex flex-col items-center text-center">
//                         <Gift className="h-10 w-10 text-primary mb-4" />
//                         <h3 className="font-medium">Step 2</h3>
//                         <p className="text-sm text-muted-foreground">Your friend makes a purchase using your link</p>
//                       </CardContent>
//                     </Card>
//                     <Card className="bg-muted/30">
//                       <CardContent className="p-6 flex flex-col items-center text-center">
//                         <CheckCircle className="h-10 w-10 text-primary mb-4" />
//                         <h3 className="font-medium">Step 3</h3>
//                         <p className="text-sm text-muted-foreground">You earn ₹500 wallet credit, they get 10% off</p>
//                       </CardContent>
//                     </Card>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <Card>
//                       <CardHeader>
//                         <CardTitle className="text-lg font-medium text-primary">Your Rewards</CardTitle>
//                       </CardHeader>
//                       <CardContent className="space-y-4">
//                         <div className="flex justify-between items-center">
//                           <span className="text-muted-foreground">Total Earned</span>
//                           <span className="font-bold text-xl">₹{referrals.totalEarned.toFixed(2)}</span>
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span className="text-muted-foreground">Pending Rewards</span>
//                           <span className="font-medium">₹{referrals.pendingEarned.toFixed(2)}</span>
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span className="text-muted-foreground">You Get</span>
//                           <span className="font-medium">{referrals.rewards.referrerReward}</span>
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span className="text-muted-foreground">Friend Gets</span>
//                           <span className="font-medium">{referrals.rewards.refereeReward}</span>
//                         </div>
//                       </CardContent>
//                     </Card>

//                     <Card>
//                       <CardHeader>
//                         <CardTitle className="text-lg font-medium text-primary">Your Referral Code</CardTitle>
//                       </CardHeader>
//                       <CardContent className="space-y-4">
//                         <div className="flex items-center gap-2">
//                           <div className="bg-muted px-3 py-2 rounded-md font-mono text-sm flex-1 text-center">
//                             {referrals.code || "Loading..."}
//                           </div>
//                           <Button
//                             variant="outline"
//                             size="icon"
//                             onClick={handleCopyReferralCode}
//                             title="Copy code"
//                             disabled={!referrals.code}
//                           >
//                             <Copy className="h-4 w-4" />
//                           </Button>
//                         </div>

//                         <div className="space-y-2">
//                           <Label htmlFor="referral-link">Your Referral Link</Label>
//                           <div className="flex">
//                             <Input
//                               id="referral-link"
//                               value={referrals.referralLink || "Loading..."}
//                               readOnly
//                               className="rounded-r-none"
//                             />
//                             <Button
//                               onClick={handleCopyReferralLink}
//                               className="bg-primary hover:bg-primary/90 rounded-l-none"
//                               disabled={!referrals.referralLink}
//                             >
//                               <Copy className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   </div>

//                   <Card>
//                     <CardHeader>
//                       <CardTitle className="text-lg font-medium text-primary">Share Your Referral</CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-6">
//                       <div className="flex flex-wrap gap-2 justify-center">
//                         <Button
//                           variant="outline"
//                           className="flex items-center gap-2"
//                           onClick={() => handleShareReferral("Email")}
//                           disabled={!referrals.referralLink}
//                         >
//                           <Mail className="h-4 w-4" />
//                           Email
//                         </Button>
//                         <Button
//                           variant="outline"
//                           className="flex items-center gap-2"
//                           onClick={() => handleShareReferral("Facebook")}
//                           disabled={!referrals.referralLink}
//                         >
//                           <Facebook className="h-4 w-4" />
//                           Facebook
//                         </Button>
//                         <Button
//                           variant="outline"
//                           className="flex items-center gap-2"
//                           onClick={() => handleShareReferral("Twitter")}
//                           disabled={!referrals.referralLink}
//                         >
//                           <Twitter className="h-4 w-4" />
//                           Twitter
//                         </Button>
//                         <Button
//                           variant="outline"
//                           className="flex items-center gap-2"
//                           onClick={() => handleShareReferral("LinkedIn")}
//                           disabled={!referrals.referralLink}
//                         >
//                           <Linkedin className="h-4 w-4" />
//                           LinkedIn
//                         </Button>
//                         <Button
//                           variant="outline"
//                           className="flex items-center gap-2"
//                           onClick={() => handleShareReferral("WhatsApp")}
//                           disabled={!referrals.referralLink}
//                         >
//                           <WhatsApp className="h-4 w-4" />
//                           WhatsApp
//                         </Button>
//                       </div>

//                       <div className="border-t pt-6">
//                         <form onSubmit={handleSendReferral}>
//                           <div className="space-y-2">
//                             <Label htmlFor="friend-email">Invite via Email</Label>
//                             <div className="flex">
//                               <Input
//                                 id="friend-email"
//                                 type="email"
//                                 placeholder="friend@example.com"
//                                 value={email}
//                                 onChange={(e) => setEmail(e.target.value)}
//                                 className="rounded-r-none"
//                               />
//                               <Button
//                                 type="submit"
//                                 className="bg-primary hover:bg-primary/90 rounded-l-none"
//                                 disabled={isSending || !email.trim() || !/\S+@\S+\.\S+/.test(email)}
//                               >
//                                 <Share2 className="h-4 w-4 mr-2" />
//                                 {isSending ? "Sending..." : "Send"}
//                               </Button>
//                             </div>
//                             {error && (
//                               <Alert variant="destructive">
//                                 <AlertDescription>{error}</AlertDescription>
//                               </Alert>
//                             )}
//                           </div>
//                         </form>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="history">
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-2xl font-bold text-primary">Referral History</CardTitle>
//               <CardDescription>Track all your referrals and rewards</CardDescription>
//             </CardHeader>
//             <CardContent>
//               {isLoading ? (
//                 <div className="text-center py-8">Loading...</div>
//               ) : referrals.history.length === 0 ? (
//                 <div className="text-center py-8">
//                   <Users className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
//                   <h3 className="text-lg font-medium">No referrals yet</h3>
//                   <p className="text-muted-foreground">Start sharing your referral link to earn rewards.</p>
//                   <Button className="mt-4 bg-primary hover:bg-primary/90" onClick={() => setActiveTab("overview")}>
//                     Start Referring
//                   </Button>
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Name</TableHead>
//                         <TableHead>Email</TableHead>
//                         <TableHead>Date</TableHead>
//                         <TableHead>Status</TableHead>
//                         <TableHead className="text-right">Reward</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {referrals.history.map((referral) => (
//                         <TableRow key={referral.id}>
//                           <TableCell className="font-medium">{referral.name}</TableCell>
//                           <TableCell>{referral.email}</TableCell>
//                           <TableCell>{new Date(referral.date).toLocaleDateString()}</TableCell>
//                           <TableCell>
//                             {referral.status === "completed" ? (
//                               <span className="flex items-center gap-1 text-green-600">
//                                 <CheckCircle className="h-4 w-4" />
//                                 Completed
//                               </span>
//                             ) : (
//                               <span className="flex items-center gap-1 text-amber-600">
//                                 <Gift className="h-4 w-4" />
//                                 Pending
//                               </span>
//                             )}
//                           </TableCell>
//                           <TableCell className="text-right">
//                             {referral.status === "completed" ? (
//                               <span className="font-medium">₹{referral.reward.toFixed(2)}</span>
//                             ) : (
//                               <span className="text-muted-foreground">--</span>
//                             )}
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default ReferEarnComponent;



import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Users,
  Copy,
  Share2,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  PhoneIcon as WhatsApp,
  Gift,
  CheckCircle,
} from "lucide-react";
import { useGetReferralsQuery } from "@/store/api/userApiSlice";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ReferEarnComponent = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const { data, isLoading, error: fetchError } = useGetReferralsQuery();
  console.log("data form the backend for referral",data);
  

  const referrals = data?.referrals || {
    code: "",
    totalEarned: 0,
    pendingEarned: 0,
    referralLink: "",
    rewards: {
      referrerReward: "₹500 wallet credit",
      refereeReward: "10% off first purchase",
    },
    history: [],
  };

  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(referrals.referralLink);
    toast.success("Referral link copied to clipboard!");
  };

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(referrals.code);
    toast.success("Referral code copied to clipboard!");
  };

  const handleShareReferral = (platform) => {
    const shareUrls = {
      Email: `mailto:?subject=Join our store&body=Sign up with my referral link to get 10% off your first purchase: ${referrals.referralLink}`,
      Facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referrals.referralLink)}`,
      Twitter: `https://twitter.com/intent/tweet?text=Join our store and get 10% off your first purchase!&url=${encodeURIComponent(referrals.referralLink)}`,
      LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referrals.referralLink)}`,
      WhatsApp: `https://api.whatsapp.com/send?text=Join our store and get 10% off your first purchase: ${referrals.referralLink}`,
    };

    window.open(shareUrls[platform], "_blank");
  };

  return (
    <div className="space-y-6">
      {fetchError && (
        <Alert variant="destructive">
          <AlertDescription>{fetchError.data?.message || "Failed to load referral details"}</AlertDescription>
        </Alert>
      )}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Program Overview</TabsTrigger>
          <TabsTrigger value="history">Referral History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary">Refer & Earn</CardTitle>
              <CardDescription>Invite friends and earn rewards when they shop</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-muted/30">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <Users className="h-10 w-10 text-primary mb-4" />
                        <h3 className="font-medium">Step 1</h3>
                        <p className="text-sm text-muted-foreground">Share your unique referral link with friends</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <Gift className="h-10 w-10 text-primary mb-4" />
                        <h3 className="font-medium">Step 2</h3>
                        <p className="text-sm text-muted-foreground">Your friend makes a purchase using your link</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <CheckCircle className="h-10 w-10 text-primary mb-4" />
                        <h3 className="font-medium">Step 3</h3>
                        <p className="text-sm text-muted-foreground">You earn ₹500 wallet credit, they get 10% off</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-medium text-primary">Your Rewards</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Total Earned</span>
                          <span className="font-bold text-xl">₹{referrals.totalEarned.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Pending Rewards</span>
                          <span className="font-medium">₹{referrals.pendingEarned.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">You Get</span>
                          <span className="font-medium">{referrals.rewards.referrerReward}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Friend Gets</span>
                          <span className="font-medium">{referrals.rewards.refereeReward}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-medium text-primary">Your Referral Code</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-muted px-3 py-2 rounded-md font-mono text-sm flex-1 text-center">
                            {referrals.code || "Loading..."}
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={handleCopyReferralCode}
                            title="Copy code"
                            disabled={!referrals.code}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="referral-link">Your Referral Link</Label>
                          <div className="flex">
                            <Input
                              id="referral-link"
                              value={referrals.referralLink || "Loading..."}
                              readOnly
                              className="rounded-r-none"
                            />
                            <Button
                              onClick={handleCopyReferralLink}
                              className="bg-primary hover:bg-primary/90 rounded-l-none"
                              disabled={!referrals.referralLink}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-medium text-primary">Share Your Referral</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Button variant="outline" className="flex items-center gap-2" onClick={() => handleShareReferral("Email")} disabled={!referrals.referralLink}>
                          <Mail className="h-4 w-4" />
                          Email
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2" onClick={() => handleShareReferral("Facebook")} disabled={!referrals.referralLink}>
                          <Facebook className="h-4 w-4" />
                          Facebook
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2" onClick={() => handleShareReferral("Twitter")} disabled={!referrals.referralLink}>
                          <Twitter className="h-4 w-4" />
                          Twitter
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2" onClick={() => handleShareReferral("LinkedIn")} disabled={!referrals.referralLink}>
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2" onClick={() => handleShareReferral("WhatsApp")} disabled={!referrals.referralLink}>
                          <WhatsApp className="h-4 w-4" />
                          WhatsApp
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary">Referral History</CardTitle>
              <CardDescription>Track all your referrals and rewards</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : referrals.history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No referral history yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Friend</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reward</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.history.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell>{entry.friend}</TableCell>
                        <TableCell>{entry.status}</TableCell>
                        <TableCell>{entry.reward}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReferEarnComponent;
