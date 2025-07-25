import dynamic from "next/dynamic"

const ExtraInfoPage = dynamic(() => import("@/components/ExtraInfoPage"), {
  ssr: false,
})

export default function Page() {
  return <ExtraInfoPage />
}
