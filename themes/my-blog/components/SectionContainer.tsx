import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function SectionContainer({ children }: Props) {
  return (
    <section className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">{children}</section>
  )
}
