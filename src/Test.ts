import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
    //

    jQuery(document).bind('gform_post_render', function () {


        const firstError = jQuery('li.gfield.gfield_error:first');
        if (firstError.length > 0) {

            // eslint-disable-next-line no-inner-declarations
            function smoothScroll(elem, options) {
                return new Promise((resolve) => {
                    if (!(elem instanceof Element)) {
                        throw new TypeError('Argument 1 must be an Element');
                    }
                    let same = 0;
                    let lastPos = null;
                    const scrollOptions = Object.assign({ behavior: 'smooth' }, options);
                    elem.scrollIntoView(scrollOptions);
                    requestAnimationFrame(check);
                    function check() {
                        const newPos = elem.getBoundingClientRect().top;
                        if (newPos === lastPos) {
                            if (same++ > 2) {
                                return resolve();
                            }
                        } else {
                            same = 0;
                            lastPos = newPos;
                        }
                        requestAnimationFrame(check);
                    }
                });
            }


            const target = firstError.find('input, select, textarea');
            if (target !== undefined && target !== null && target[0] !== null && target[0] !== undefined) {

                setTimeout(function () {
                    setInterval(function () {
                        console.log("scroll");
                        smoothScroll(target[0], {
                            block: "center"
                        })
                    }, 1000);
                }, 1000);

            }


        }
    });


} // function