export default function() {

	let animations = [];


	function Animator() {

	}

	Animator.prototype.add = function(f) {
		animations.push(f);
	};

	Animator.prototype.debug = function() {
		console.log(animations);
	};


	return new Animator();

}