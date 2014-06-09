function ouijaKeyboard(){
	var self = this;
	self.debug = true;
	self.thread;
	self.shift = false;
	self.caps = false;
	self.special_chars = { '`':'~', '1':'!', '2':'@', '3':'#', '4':'$', '5':'%', '6':'^', '7':'&', '8':'*', '9':'(', '0':')', '-':'_', '=':'+', '[':'{', ']':'}', ';':':', "'":'"', ',':'<', '.':'>', '/':'?', '\\':'|' };
	self.last_key = '';
	self.touch = ('ontouchstart' in document.documentElement) ? true : false;

	self.clickKey = function(key){
		var output = self.$text.val();
		self.last_key = key;
		var char = key;
		switch(char){
			case 'l_shift':
			case 'r_shift':
				char = '';
				self.toggleShift();
				break;
			case 'caps':
				char = '';
				self.toggleCaps();
				break;
			case 'enter':
				char = '\n';
				break;
			case 'space':
				char = ' ';
				break;
			case 'tab':
				char = '    ';
				break;
			case 'bs':
				char = '';
				output = output.substring(0, output.length - 1);
				break;
			case 'l_ctrl':
			case 'start':
			case 'l_alt':
			case 'r_alt':
			case 'print':
			case 'r_ctrl':
			case 'arrow':
				char = '';
				break;
			default:
				if (self.shift){ // is shifted, convert to upper
					char = char.toUpperCase();
					char = special_chars[char] || char; // lookup special chars
					self.toggleShift(); // undo shift
				}
				else if (self.caps){ // is caps lock, convert to upper
					char = char.toUpperCase();
				}
		}

		self.$status.html('Caps: ' + self.caps + ' Shift: ' + self.shift + ' Key Pressed: ' + key);
		self.$text.val(output + char); // new output is current + char
		self.$keyboard_large_div.css('display','none');
	}

	self.toggleShift = function(){
		self.shift = (self.shift) ? false : true;
	}

	self.toggleCaps = function(){
		self.caps = (self.caps) ? false : true;
	}

	self.lookupKey = function(pos){
		var key = '';
		$('area').each(function(){
			var coords = $(this).attr('coords').split(',');
			if (pos.x >= coords[0] && pos.y >= coords[1] && pos.x <= coords[2] && pos.y <= coords[3]){
				key = $(this).attr('alt');
				return; // exit each
			}
		});
		if (key !== self.last_key) // keys must be different
			self.clickKey(key);
		self.log('keylookup ' + key);
	}

	self.onMouseStop = function(){
		self.log('mouse stopped at ' + window.mouseXPos + ',' + window.mouseYPos);
		/*
		var e = new jQuery.Event('click');
		e.pageX = window.mouseXPos;
		e.pageY = window.mouseYPos;
		self.$keyboard_small.trigger(e);
		//*/
		self.lookupKey({x: ((window.mouseXPos - self.$keyboard_small.offset().left) * 2), y: ((window.mouseYPos - self.$keyboard_small.offset().top) * 2)})
	}, self.thread;

	self.selectText = function(){
		/*
		var text = document.getElementById('text_output');
		text.selectionStart = 0;
		text.selectionEnd = text.value.length;
		//*/
		self.$text.focus();
		self.$text.select();
		self.$status.html('Selected!');
	}

	self.copyToClipboard = function(){
		var text = self.$text.val();
		self.log('$.copy '+text);
		self.$text.copy();
		//$.copy(text);
		self.$status.html('Copied!');
	}

	self.log = function(str){
		if (self.debug === true)
			console.log(str);
	}

	self.init = function(params){
		$(document).mousemove(function(e){ // save mouse coords
			window.mouseXPos = e.pageX;
			window.mouseYPos = e.pageY;
		});

		self.$keyboard = $('.ouijaKeyboard');
		self.$status = $('#status');
		self.$keyboard_small = $('#keyboard_small');
		self.$keyboard_large = $('#keyboard_large');
		self.$keyboard_large_div = $('#keyboard_large_div');
		self.$text = $('#text_output');
		self.event_type = self.touch ? 'touchstart' : 'click';

		if (!self.touch){
			self.$keyboard.on('mousemove', '#keyboard_small', function(e){
				self.log('mouse moved');
				clearTimeout(self.thread);
				self.thread = setTimeout(self.onMouseStop, 300);
			});
		}

		self.$keyboard.on(self.event_type, '#keyboard_small', function(e){
			if (self.$keyboard_large_div.css('display') !== 'inline'){ // ignore if already open
				clearTimeout(self.thread);
				//thread = setTimeout(onMouseStop, 300);
				if (self.touch){ // uses touch
					pageX = e.originalEvent.changedTouches[0].pageX; // e.originalEvent.touches, e.originalEvent.targetTouches
					pageY = e.originalEvent.changedTouches[0].pageY;
				}
				else{
					pageX = e.pageX;
					pageY = e.pageY;
				}

				var x = pageX - $(this).offset().left;
				var y = pageY - $(this).offset().top;
				var kb_width = $(this).width();
				var kb_height = $(this).height();

				var box_size = kb_height / 2;
				var box = {};

				// x-axis - horizontal
				if (x - (box_size / 2) < 0){
					self.log('x-axis - box extends before');
					box.left = 0;
					box.right = box_size;
				}
				else if (x + (box_size / 2) > kb_width){
					self.log('x-axis - box extends after');
					box.left = kb_width - box_size;
					box.right = kb_width;
				}
				else{
					self.log('x-axis - box falls in range without conflict');
					box.left = x - (box_size / 2);
					box.right = x + (box_size / 2);
				}

				// y-axis - vertical
				if (y - (box_size / 2) < 0){
					self.log('y-axis - box extends above');
					box.top = 0;
					box.bottom = box_size;
				}
				else if (y + (box_size / 2) > kb_height){
					self.log('y-axis - box extends below');
					box.top = kb_height - box_size;
					box.bottom = kb_height;
				}
				else{
					self.log('y-axis - box falls in range without conflict');
					box.top = y - (box_size / 2);
					box.bottom = y + (box_size / 2);
				}

				//rect (top, right, bottom, left)
				self.$keyboard_large.css('clip','rect(' + (box.top * 2) + 'px,' + (box.right * 2) + 'px,' + (box.bottom * 2) + 'px,' + (box.left * 2) + 'px)');

				shift_left = pageX - box_size - ((x - (box_size / 2)) * 2); // point move left for box size + reset to origin
				shift_top = pageY - box_size - ((y - (box_size / 2)) * 2);

				//*
				self.log('$(this).offset().left: '+$(this).offset().left+' $(this).offset().top: '+$(this).offset().top);
				self.log('x: '+x+' y:'+y);
				self.log('kb_width: '+kb_width+' kb_height:'+kb_height);
				self.log('box: '+JSON.stringify(box));
				self.log('pageX: '+pageX+' pageY: '+pageY);
				self.log('shift_left: '+shift_left+' shift_top: '+shift_top);
				//*/

				self.$keyboard_large.css('left',shift_left+'px');
				self.$keyboard_large.css('top',shift_top+'px');

				self.$keyboard_large_div.css('display','inline');
			}
		});

		self.$keyboard.on(self.event_type, 'area', function(e){
			if (self.touch){ // uses touch
				pageX = e.originalEvent.changedTouches[0].pageX;
				pageY = e.originalEvent.changedTouches[0].pageY;
			}
			else{
				pageX = e.pageX;
				pageY = e.pageY;
			}

			var x = pageX - $(this).offset().left;
			var y = pageY - $(this).offset().top;
			//var coords = $(this).attr('coords').split(',');
			var key = $(this).attr('alt');
			self.clickKey(key);
			//e.stopPropagation();
		});

		self.$keyboard.on(self.event_type, '#select_text', function(){
			self.selectText();
		});

		self.$keyboard.on(self.event_type, '#copy_text', function(){
			self.copyToClipboard();
		});

		/*
		//ZeroClipboard.config( { moviePath: 'js/ZeroClipboard.swf' } );
		self.$clip = new ZeroClipboard( $('#copy_text') );

		self.$clip.on( 'ready', function( readyEvent ){
			self.log('ZeroClipboard SWF is ready!');
			self.$clip.on( 'copy', function(clip){
				var text = self.$text.val();
				self.log('clip.setText '+text);
				clip.setText(text);
			});

			self.$clip.on( 'aftercopy', function( event ){
				self.$status.html('Copied!'); // event.data["text/plain"]
			});
		});
		//*/
	}();
}