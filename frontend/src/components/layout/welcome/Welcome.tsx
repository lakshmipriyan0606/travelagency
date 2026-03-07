import Exclimation from '@/assets/icons/Exclimation.svg'



const Welcome = () => {
    return (
        <section className=" main__container_space">
            <div className='main__container_space_nextContainer'>
                <h1 className="main_title">Welcome to  <span className="text-primary">Sastikaa Travels!</span></h1>

                <p className="mt-6 text-[14px] sm:text-[16px] lg:text-lg text-justify"> <span className="text-4xl ">We</span> believe <span className="text-primary">every journey should be more than just travel</span> —it should be a story you cherish forever. Based on trust, care, and expertise, we design travel experiences that blend comfort, adventure, and culture. Whether it’s exploring vibrant cities, relaxing getaways, or customized holiday plans, we make sure your trip is seamless and memorable. With dedicated service and carefully curated packages, Sastikaa Travels is your trusted partner for discovering the world in a way that feels personal and unique.</p>
                <p className="text-[14px] sm:text-[16px] lg:text-lg mt-4 text-justify">Pride in offering reliable services, carefully curated itineraries and complete transparency in every booking. From flight tickets to hotel stays, guided tours to adventure activities, Sastikaa Travels is your trusted partner for stress-free travel. With us, you don’t just visit a place — you truly experience it. Wherever your next journey takes you, let Sastikaa Travels turn it into a story worth telling.</p>
                <p className="text-[14px] sm:text-[16px] lg:text-lg mt-4 text-justify">Pride in offering reliable services, carefully curated itineraries and complete transparency in every booking. From flight tickets to hotel stays, guided tours to adventure activities, Sastikaa Travels is your trusted partner for stress-free travel. With us, you don’t just visit a place — you truly experience it. Wherever your next journey takes you, let Sastikaa Travels turn it into a story worth telling.
                    itineraries and complete transparency in every booking. From flight tickets to hotel stays, guided tours to adventure activities, Sastikaa Travels is your trusted partner for stress-free travel. With us, you don’t just visit a place — you truly experience it. Wherever your next journey takes you, let Sastikaa Travels turn it into a story worth telling.
                    Sastikaa Travels is your trusted partner for stress-free travel. With us, you don’t just visit a place — s you, let Sastikaa Travels turn it into a story worth telling.
                </p>

                <section className='flex items-center gap-2 mb-20'>
                    <img src={Exclimation} className='w-10 h-10' alt="" />
                    <div className='relative flex-1 top-[70px] sm:top-[100px] border border-[#9C9C9C] rounded-[10px] text-center  text-xl p-2 sm:text-5xl sm:p-5'>
                        <h1 className='font-accent font-thin'> Travel isn’t about the miles you cover, it’s about
                            memories you create.
                        </h1>
                        <p className='text-[16px] sm:text-xl text-right sm:pt-5'>- Sastikaa Travels</p>
                    </div>
                </section>

            </div>
        </section>
    )
}

export default Welcome