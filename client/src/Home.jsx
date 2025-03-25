
  import { useState, useEffect } from "react"
  import { ShoppingCart, Heart, Search, User, Menu, X } from "lucide-react"
  import { Button } from "@/components/ui/button"
  import { Input } from "@/components/ui/input"
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
  import { useGetProductsQuery } from "./store/api/userApiSlice"
  import { useGetFeaturedProductQuery } from './store/api/userApiSlice'



  export default function LandingPage() {
    const [currentBanner, setCurrentBanner] = useState(0)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)


    const { data: products, isLoading, isError } = useGetFeaturedProductQuery();
    console.log(products);
    
    
    const banners = [
      {
        image: "./Banner-01.jpg?height=600&width=1600",
        title: "Premium Coffee Beans",
        description: "Sourced from the finest farms around the world",
        cta: "Shop Now",
      },
      {
        image: "/placeholder.svg?height=600&width=1600",
        title: "Professional Equipment",
        description: "Elevate your coffee experience with our premium machines",
        cta: "Explore",
      },
      {
        image: "/placeholder.svg?height=600&width=1600",
        title: "Limited Edition Collection",
        description: "Try our seasonal blends before they're gone",
        cta: "Buy Now",
      },
    ]


    return (
      <div className="min-h-screen flex flex-col">
        {/* Header/Navbar */}
        <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center">
                <a href="/" className="flex items-center">
                  <span className="text-2xl font-bold text-primary">Black Beans</span>
                </a>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <a href="/" className="font-medium hover:text-primary">
                  HOME
                </a>
                <a href="/shop" className="font-medium hover:text-primary">
                  SHOP
                </a>
                <a href="/contact" className="font-medium hover:text-primary">
                  CONTACT
                </a>
              </nav>

              {/* Right Side Options */}
              <div className="hidden md:flex items-center space-x-4">
                <button aria-label="Search" className="p-2 hover:bg-muted rounded-full">
                  <Search className="h-5 w-5" />
                </button>
                <a href="/account" className="p-2 hover:bg-muted rounded-full">
                  <User className="h-5 w-5" />
                </a>
                <a href="/wishlist" className="p-2 hover:bg-muted rounded-full">
                  <Heart className="h-5 w-5" />
                </a>
                <a href="/cart" className="p-2 hover:bg-muted rounded-full">
                  <ShoppingCart className="h-5 w-5" />
                </a>
              </div>

              {/* Mobile Menu Button */}
              <button className="md:hidden p-2 rounded-md" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-b">
              <div className="container mx-auto px-4 py-3 space-y-1">
                <a href="/" className="block py-2 px-3 hover:bg-muted rounded-md">
                  HOME
                </a>
                <a href="/shop" className="block py-2 px-3 hover:bg-muted rounded-md">
                  SHOP
                </a>
                <a href="/contact" className="block py-2 px-3 hover:bg-muted rounded-md">
                  CONTACT
                </a>
                <div className="flex items-center space-x-4 pt-2">
                  <button aria-label="Search" className="p-2 hover:bg-muted rounded-full">
                    <Search className="h-5 w-5" />
                  </button>
                  <a href="/account" className="p-2 hover:bg-muted rounded-full">
                    <User className="h-5 w-5" />
                  </a>
                  <a href="/wishlist" className="p-2 hover:bg-muted rounded-full">
                    <Heart className="h-5 w-5" />
                  </a>
                  <a href="/cart" className="p-2 hover:bg-muted rounded-full">
                    <ShoppingCart className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </header>

        <main className="flex-grow">
          {/* Hero Banner */}
          <section className="relative h-[500px] overflow-hidden">
            {banners.map((banner, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentBanner ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="absolute inset-0 bg-black/40 z-10" />
                <img src={banner.image || "/placeholder.svg"} alt={banner.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white p-4">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">{banner.title}</h1>
                  <p className="text-lg md:text-xl mb-8 max-w-2xl">{banner.description}</p>
                  <Button size="lg">{banner.cta}</Button>
                </div>
              </div>
            ))}

            {/* Banner Navigation Dots */}
            <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center space-x-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBanner(index)}
                  className={`w-3 h-3 rounded-full ${index === currentBanner ? "bg-white" : "bg-white/50"}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </section>

          {/* Featured Products */}
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products?.products?.map((product) => (
                  <div key={product.id} className="group">
                    <div className="relative overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-lg">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button className="p-2 bg-white rounded-full shadow-md hover:bg-muted">
                          <Heart className="h-5 w-5" />
                        </button>
                      </div>
                      {/* <div className="p-4">
                        <h3 className="font-medium text-lg mb-2">{product.name}</h3>
                        <p className="text-primary font-bold">${product.price.toFixed(2)}</p>
                        <Button className="w-full mt-4">Add to Cart</Button>
                      </div> */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Decorative Section */}
          <section className="py-16 bg-[#f8f5f2]">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-6">Crafted with Passion</h2>
                  <p className="text-muted-foreground mb-6">
                    At Black Beans, we believe that great coffee is an art form. From carefully selecting the finest beans
                    to perfecting the roasting process, we're dedicated to bringing you exceptional coffee experiences.
                  </p>
                  <Button variant="outline">Our Story</Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <img src="/placeholder.svg?height=300&width=300" alt="Coffee beans" className="rounded-lg shadow-md" />
                  <img
                    src="/placeholder.svg?height=300&width=300"
                    alt="Coffee brewing"
                    className="rounded-lg shadow-md mt-8"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Categories Section */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>

              <Tabs defaultValue="beans" className="w-full">
                <div className="flex justify-center mb-8">
                  <TabsList>
                    <TabsTrigger value="beans">Coffee Beans</TabsTrigger>
                    <TabsTrigger value="equipment">Equipment</TabsTrigger>
                  </TabsList>
                </div>

                {/* <TabsContent value="beans">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {categoryProducts.beans.map((product) => (
                      <div key={product.id} className="group">
                        <div className="relative overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-lg">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-64 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button className="p-2 bg-white rounded-full shadow-md hover:bg-muted">
                              <Heart className="h-5 w-5" />
                            </button>
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium text-lg mb-2">{product.name}</h3>
                            <p className="text-primary font-bold">${product.price.toFixed(2)}</p>
                            <Button className="w-full mt-4">Add to Cart</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent> */}

                {/* <TabsContent value="equipment">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {categoryProducts.equipment.map((product) => (
                      <div key={product.id} className="group">
                        <div className="relative overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-lg">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-64 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button className="p-2 bg-white rounded-full shadow-md hover:bg-muted">
                              <Heart className="h-5 w-5" />
                            </button>
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium text-lg mb-2">{product.name}</h3>
                            <p className="text-primary font-bold">${product.price.toFixed(2)}</p>
                            <Button className="w-full mt-4">Add to Cart</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent> */}
              </Tabs>
            </div>
          </section>

          {/* Product Showcase */}
          <section className="py-16 bg-[#2c1810] text-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Elevate Your Coffee Experience</h2>
                <p className="max-w-2xl mx-auto text-white/80">
                  Discover our premium selection of coffee beans and equipment designed to transform your daily ritual.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="relative rounded-lg overflow-hidden group">
                  <img
                    src="/placeholder.svg?height=400&width=400"
                    alt="Premium Coffee Beans"
                    className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-xl font-bold mb-2">Premium Beans</h3>
                    <p className="text-white/80 mb-4">Sourced from the world's finest coffee regions</p>
                    <Button
                      variant="outline"
                      className="bg-transparent border-white text-white hover:bg-white hover:text-black"
                    >
                      Shop Beans
                    </Button>
                  </div>
                </div>

                <div className="relative rounded-lg overflow-hidden group">
                  <img
                    src="/placeholder.svg?height=400&width=400"
                    alt="Professional Equipment"
                    className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-xl font-bold mb-2">Professional Equipment</h3>
                    <p className="text-white/80 mb-4">Tools for the perfect brew every time</p>
                    <Button
                      variant="outline"
                      className="bg-transparent border-white text-white hover:bg-white hover:text-black"
                    >
                      Shop Equipment
                    </Button>
                  </div>
                </div>

                <div className="relative rounded-lg overflow-hidden group">
                  <img
                    src="/placeholder.svg?height=400&width=400"
                    alt="Gift Sets"
                    className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-xl font-bold mb-2">Curated Gift Sets</h3>
                    <p className="text-white/80 mb-4">Perfect presents for coffee enthusiasts</p>
                    <Button
                      variant="outline"
                      className="bg-transparent border-white text-white hover:bg-white hover:text-black"
                    >
                      Shop Gifts
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Newsletter */}
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4 max-w-3xl text-center">
              <h2 className="text-3xl font-bold mb-4">Join Our Coffee Club</h2>
              <p className="text-muted-foreground mb-8">
                Subscribe to our newsletter for exclusive offers, brewing tips, and early access to limited edition beans.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input type="email" placeholder="Your email address" className="flex-grow" />
                <Button>Subscribe</Button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-[#1a0f09] text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Black Beans</h3>
                <p className="text-white/70 mb-4">Premium coffee beans and equipment for the perfect brew experience.</p>
                <div className="flex space-x-4">
                  <a href="#" className="text-white/70 hover:text-white">
                    <span className="sr-only">Facebook</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                  <a href="#" className="text-white/70 hover:text-white">
                    <span className="sr-only">Instagram</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                  <a href="#" className="text-white/70 hover:text-white">
                    <span className="sr-only">Twitter</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Shop</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-white/70 hover:text-white">
                      Coffee Beans
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white/70 hover:text-white">
                      Brewing Equipment
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white/70 hover:text-white">
                      Grinders
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white/70 hover:text-white">
                      Gift Sets
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white/70 hover:text-white">
                      Accessories
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-white/70 hover:text-white">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white/70 hover:text-white">
                      Sustainability
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white/70 hover:text-white">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white/70 hover:text-white">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white/70 hover:text-white">
                      Press
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Support</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-white/70 hover:text-white">
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white/70 hover:text-white">
                      FAQs
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white/70 hover:text-white">
                      Shipping & Returns
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white/70 hover:text-white">
                      Track Order
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white/70 hover:text-white">
                      Privacy Policy
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/20 mt-12 pt-8 text-center text-white/50 text-sm">
              <p>&copy; {new Date().getFullYear()} Black Beans. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    )
  }

