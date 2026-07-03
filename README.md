# training_paces_calculator
Based on the Jack Daniel's VDot calculator, this program takes a runner's race time and gives them training paces for our NC State Club Running specific training terminology. This will allow club members to input their times and get their specific training paces for workouts.

NC State Club XC/TF training terminology:
- Critical Velocity (CV): 12-20s slower per mile than 5k fitness
- Lactic Threshold (LT) : 25-35s slower per mile than 5k fitness
- Movin'/Marathon (MP)  : 45-55s slower per mile than 5k fitness
- Steady Tempo (ST)     : 60-70s slower per mile than 5k fitness
- Endurance Tempo (ET)  : 75-90s slower per mile than 5k fitness

## VDot Score Equations

The VDot score is calculated using two equations, one for oxygen consumption, and another for sustainable effort duration.

### Oxygen Equation

$$VO_2=-4.60+0.182258v+0.000104v^2$$

where $v$ is the velocity in meters per minute. To convert distance and time into meters per minute, we use the equation 

$$v=\frac{d}{t}$$

where $d$ is the race distance in meters, $t$ is the time.

### Sustainable Effort Equation

$$\\%VO_2=0.8+0.1894393e^{-0.012778t}+0.2989558e^{-0.1932605t}$$

where $t$ is the race time in minutes.

### VDot Equation

The Vdot equation is then $\frac{VO_2}{\\%VO_2}$. To visualize the VDot equation for different distances and race times, visit https://www.desmos.com/calculator/ntlezscx3p

## Training Pace Calculations

Daniel's training paces are split into 5 categories based on the %VDot as a measure of fitness/effort. Our training paces are based off of 5k fitness, so we first convert the user's performance into their VDot equivalent 5k time, and then calculate paces from that. 

Since the VDot formula is a transcendental equation however ($t$ appears quadratically in the numerator and exponentially in the denominator), we cannot use algebraic methods to reverse-engineer 5k time from VDot score. Instead we use the bisection method (binary search) to estimate the user's 5k race time.

## References
- https://www.brenoamelo.com/calculators/vdot?srsltid=AfmBOooGboKvwSWpYgE48MLwSOL4Lmx_g_gaWalOsRn-WeO6657gEFGP
