import { notFound } from "next/navigation";

// NEW FLOW: contracts, electronic signing and auto-populated agreements are
// disabled for now on attorney advice, so this route returns 404.
// The previous page is kept below, commented out, to restore later.
export default function AgreementPage() {
  notFound();
}

// ============================ OLD FLOW (disabled) ============================
// import Navbar from "@/components/shared/navbar/Navbar";
// import AgreementContainer from "./_components/AgreementContainer";
// import Container from "@/components/shared/container/Container";
//
// export default function AgreementPage() {
//   return (
//     <>
//       <Navbar className="pt-10" />
//       <Container className="mt-10">
//         <AgreementContainer />
//       </Container>
//     </>
//   );
// }
