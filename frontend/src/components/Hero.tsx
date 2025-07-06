import React from "react";

export function Hero() {
	return (
		<section className="relative overflow-hidden bg-gradient-to-br from-ocean-600 via-ocean-700 to-ocean-800 text-white">
			{/* Background Pattern */}
			<div className="absolute inset-0 opacity-10">
				<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-y-6 translate-y-12"></div>
				<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-y-6 translate-y-24"></div>
			</div>

			{/* Floating Elements */}
			<div className="absolute top-20 left-10 w-32 h-32 bg-ocean-400/20 rounded-full blur-xl animate-pulse-slow"></div>
			<div
				className="absolute top-40 right-20 w-48 h-48 bg-asi-400/20 rounded-full blur-xl animate-pulse-slow"
				style={{ animationDelay: "1s" }}
			></div>
			<div
				className="absolute bottom-20 left-1/4 w-24 h-24 bg-self-400/20 rounded-full blur-xl animate-pulse-slow"
				style={{ animationDelay: "2s" }}
			></div>

			<div className="relative px-4 py-24 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="text-center">
					{/* Main Heading */}
					<h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
						<span className="block">Private AI Platform</span>
						<span className="block bg-gradient-to-r from-ocean-200 to-ocean-100 bg-clip-text text-transparent">
							Real Estate Data Broker
						</span>
					</h1>

					{/* Subtitle */}
					<p className="mt-6 text-xl leading-8 text-ocean-100 max-w-3xl mx-auto">
						Secure, privacy-preserving real estate data analysis combining{" "}
						<span className="font-semibold text-ocean-200">Ocean Protocol</span>
						,{" "}
						<span className="font-semibold text-ocean-200">Self Protocol</span>,
						and <span className="font-semibold text-ocean-200">ASI-1 mini</span>{" "}
						for intelligent insights without compromising data privacy.
					</p>

					{/* Technology Badges */}
					<div className="mt-10 flex flex-wrap justify-center gap-4">
						<div className="glass-ocean rounded-full px-6 py-3 flex items-center gap-2">
							<span className="text-2xl">🌊</span>
							<span className="text-sm font-medium">Ocean Protocol</span>
						</div>
						<div className="glass-white rounded-full px-6 py-3 flex items-center gap-2">
							<span className="text-2xl">🔐</span>
							<span className="text-sm font-medium text-gray-900">
								Self Protocol
							</span>
						</div>
						<div className="glass-white rounded-full px-6 py-3 flex items-center gap-2">
							<span className="text-2xl">🤖</span>
							<span className="text-sm font-medium text-gray-900">
								ASI-1 mini
							</span>
						</div>
						<div className="glass-white rounded-full px-6 py-3 flex items-center gap-2">
							<span className="text-2xl">⚡</span>
							<span className="text-sm font-medium text-gray-900">Fluence</span>
						</div>
					</div>

					{/* Call to Action */}
					<div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
						<button className="btn-ocean text-lg px-8 py-4 shadow-xl-ocean hover:shadow-glow transform hover:scale-105 transition-all duration-200">
							Start Analysis
						</button>
						<button className="btn-ocean-outline text-lg px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm">
							Learn More
						</button>
					</div>

					{/* Stats Section */}
					<div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
						<div className="text-center">
							<div className="text-4xl font-bold text-ocean-100 mb-2">487</div>
							<div className="text-sm text-ocean-300">Properties Analyzed</div>
						</div>
						<div className="text-center">
							<div className="text-4xl font-bold text-ocean-100 mb-2">100%</div>
							<div className="text-sm text-ocean-300">Privacy Preserved</div>
						</div>
						<div className="text-center">
							<div className="text-4xl font-bold text-ocean-100 mb-2">
								&lt;5min
							</div>
							<div className="text-sm text-ocean-300">Analysis Time</div>
						</div>
					</div>
				</div>
			</div>

			{/* Bottom Wave */}
			<div className="absolute bottom-0 left-0 right-0">
				<svg
					viewBox="0 0 1200 120"
					preserveAspectRatio="none"
					className="w-full h-16 fill-gray-50"
				>
					<path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" />
				</svg>
			</div>
		</section>
	);
}
