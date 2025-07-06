import React from "react";

export function Features() {
	const features = [
		{
			icon: "🌊",
			title: "Ocean Protocol Integration",
			description:
				"Access private real estate datasets through secure compute-to-data technology. Data never leaves the secure environment.",
			gradient: "from-ocean-500 to-ocean-600",
			bgGradient: "from-ocean-50 to-ocean-100",
			iconBg: "bg-ocean-100 text-ocean-600",
			points: [
				"Secure data access via C2D",
				"Privacy-preserving computation",
				"Decentralized data marketplace",
				"Smart contract automation",
			],
		},
		{
			icon: "🔐",
			title: "Self Protocol Verification",
			description:
				"Zero-knowledge identity verification for age, residency, and professional credentials without revealing sensitive information.",
			gradient: "from-self-500 to-self-600",
			bgGradient: "from-self-50 to-self-100",
			iconBg: "bg-self-100 text-self-600",
			points: [
				"Zero-knowledge proofs",
				"Identity verification",
				"Professional credentials",
				"Privacy-first approach",
			],
		},
		{
			icon: "🤖",
			title: "ASI-1 mini AI Analysis",
			description:
				"Advanced AI-powered insights and recommendations for real estate investment decisions using state-of-the-art machine learning.",
			gradient: "from-asi-500 to-asi-600",
			bgGradient: "from-asi-50 to-asi-100",
			iconBg: "bg-asi-100 text-asi-600",
			points: [
				"Advanced AI analysis",
				"Market trend prediction",
				"Investment recommendations",
				"Real-time insights",
			],
		},
		{
			icon: "⚡",
			title: "Fluence Deployment",
			description:
				"Decentralized compute network providing scalable, reliable infrastructure for data processing and AI computations.",
			gradient: "from-estate-500 to-estate-600",
			bgGradient: "from-estate-50 to-estate-100",
			iconBg: "bg-estate-100 text-estate-600",
			points: [
				"Decentralized compute",
				"Scalable infrastructure",
				"High availability",
				"Cost-effective processing",
			],
		},
	];

	const benefits = [
		{
			icon: "🔒",
			title: "Complete Privacy",
			description:
				"Your data remains private throughout the entire analysis process",
		},
		{
			icon: "⚡",
			title: "Fast Processing",
			description:
				"Get insights in under 5 minutes with efficient compute infrastructure",
		},
		{
			icon: "🎯",
			title: "Accurate Insights",
			description: "AI-powered analysis with 88%+ confidence levels",
		},
		{
			icon: "💼",
			title: "Professional Grade",
			description: "Enterprise-level security and reliability for all users",
		},
	];

	return (
		<section className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50">
			<div className="container mx-auto px-4">
				<div className="max-w-6xl mx-auto">
					{/* Section Header */}
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">
							<span className="ocean-gradient-text">Powered by</span> Leading
							Technologies
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Our platform integrates cutting-edge blockchain, AI, and privacy
							technologies to deliver secure, intelligent real estate data
							analysis.
						</p>
					</div>

					{/* Main Features Grid */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
						{features.map((feature, index) => (
							<div
								key={index}
								className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${feature.bgGradient} p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
							>
								{/* Background Pattern */}
								<div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

								<div className="relative">
									{/* Icon */}
									<div
										className={`inline-flex items-center justify-center w-16 h-16 ${feature.iconBg} rounded-2xl mb-6 text-2xl shadow-sm`}
									>
										{feature.icon}
									</div>

									{/* Content */}
									<h3 className="text-2xl font-bold text-gray-900 mb-4">
										{feature.title}
									</h3>
									<p className="text-gray-700 mb-6 leading-relaxed">
										{feature.description}
									</p>

									{/* Key Points */}
									<ul className="space-y-3">
										{feature.points.map((point, pointIndex) => (
											<li
												key={pointIndex}
												className="flex items-center text-gray-700"
											>
												<div className="w-2 h-2 bg-gradient-to-r bg-gray-400 rounded-full mr-3 flex-shrink-0"></div>
												<span className="text-sm">{point}</span>
											</li>
										))}
									</ul>
								</div>
							</div>
						))}
					</div>

					{/* Benefits Section */}
					<div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100">
						<div className="text-center mb-12">
							<h3 className="text-3xl font-bold text-gray-900 mb-4">
								Why Choose Our Platform?
							</h3>
							<p className="text-gray-600 max-w-2xl mx-auto">
								Experience the next generation of privacy-preserving data
								analysis with enterprise-grade security and AI-powered insights.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
							{benefits.map((benefit, index) => (
								<div key={index} className="text-center group">
									<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-ocean-100 to-ocean-200 rounded-2xl mb-4 text-2xl group-hover:scale-110 transition-transform duration-200">
										{benefit.icon}
									</div>
									<h4 className="text-lg font-semibold text-gray-900 mb-2">
										{benefit.title}
									</h4>
									<p className="text-gray-600 text-sm">{benefit.description}</p>
								</div>
							))}
						</div>
					</div>

					{/* Technology Stack Showcase */}
					<div className="mt-20 text-center">
						<h3 className="text-2xl font-bold text-gray-900 mb-8">
							Built on Trusted Infrastructure
						</h3>
						<div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
							<div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
								<span className="text-lg">🌊</span>
								<span className="font-medium text-gray-700">
									Ocean Protocol
								</span>
							</div>
							<div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
								<span className="text-lg">🔐</span>
								<span className="font-medium text-gray-700">Self Protocol</span>
							</div>
							<div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
								<span className="text-lg">🤖</span>
								<span className="font-medium text-gray-700">Fetch.ai</span>
							</div>
							<div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
								<span className="text-lg">⚡</span>
								<span className="font-medium text-gray-700">Fluence</span>
							</div>
							<div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
								<span className="text-lg">⚛️</span>
								<span className="font-medium text-gray-700">React</span>
							</div>
							<div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
								<span className="text-lg">🎨</span>
								<span className="font-medium text-gray-700">Tailwind CSS</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
