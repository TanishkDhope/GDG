import { useEffect } from 'react'
import Navbar from './Navbar'
import { useAccount } from 'wagmi'

const Test = () => {
    const { address, isConnected } = useAccount();
    useEffect(() => {
        console.log(address)
    }, [address])
    return (
        <div>
            <Navbar />
            {isConnected && (
                <p className="text-white top-30 text-sm break-all">{address}</p>
            )}



        </div>
    )
}

export default Test