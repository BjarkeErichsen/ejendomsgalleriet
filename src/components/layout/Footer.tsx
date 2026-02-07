import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">EG</span>
              </div>
              <span className="text-lg font-bold text-white">Ejendomsgalleriet</span>
            </div>
            <p className="text-sm text-gray-400">
              Danmarks markedsplads for erhvervsejendomme. Find kontor, butik, lager og meget mere.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Søg ejendomme
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/soeg?type=leje" className="text-sm hover:text-white transition-colors">
                  Leje
                </Link>
              </li>
              <li>
                <Link href="/soeg?type=salg" className="text-sm hover:text-white transition-colors">
                  Salg
                </Link>
              </li>
              <li>
                <Link href="/soeg?type=investering" className="text-sm hover:text-white transition-colors">
                  Investering
                </Link>
              </li>
              <li>
                <Link href="/statistik" className="text-sm hover:text-white transition-colors">
                  Statistik
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Ejendomstyper
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/soeg?usage=kontor" className="text-sm hover:text-white transition-colors">
                  Kontor
                </Link>
              </li>
              <li>
                <Link href="/soeg?usage=detailhandel" className="text-sm hover:text-white transition-colors">
                  Butik & detailhandel
                </Link>
              </li>
              <li>
                <Link href="/soeg?usage=lager" className="text-sm hover:text-white transition-colors">
                  Lager & produktion
                </Link>
              </li>
              <li>
                <Link href="/soeg?usage=hotel_restaurant" className="text-sm hover:text-white transition-colors">
                  Hotel & restaurant
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Konto
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="text-sm hover:text-white transition-colors">
                  Log ind
                </Link>
              </li>
              <li>
                <Link href="/registrer" className="text-sm hover:text-white transition-colors">
                  Opret konto
                </Link>
              </li>
              <li>
                <Link href="/opret" className="text-sm hover:text-white transition-colors">
                  Opret annonce
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8 text-sm text-gray-500 text-center">
          &copy; {new Date().getFullYear()} Ejendomsgalleriet. Alle rettigheder forbeholdes.
        </div>
      </div>
    </footer>
  )
}
