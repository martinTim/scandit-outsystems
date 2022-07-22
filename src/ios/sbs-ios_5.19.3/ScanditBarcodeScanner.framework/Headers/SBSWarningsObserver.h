//
//  SBSWarningsListener.h
//  ScanditBarcodeScanner
//
//  Created by Luca Torella on 01.04.19.
//  Copyright © 2019 Scandit AG. All rights reserved.
//

#import <Foundation/Foundation.h>

@class SBSBarcodePicker;

NS_ASSUME_NONNULL_BEGIN

/**
 * Recognition Warnings
 *
 * \since 5.11.1
 */
typedef NS_OPTIONS(NSUInteger, SBSWarning) {
    /**
     * \brief Too much glare warning
     *
     * \since 5.11.1
     */
    SBSWarningTooMuchGlare = 1 << 0,
    /**
     * \brief Not enough contrast warning
     *
     * \since 5.11.1
     */
    SBSWarningNotEnoughContrast = 1 << 1,
};

/**
 * Defines the Protocol for adding custom logic to be executed after every time a warning is raised
 * by the frame processing engine. Possible warnings that can invoke the delegate method include
 * \link SBSWarningTooMuchGlare\endlink and \link SBSWarningNotEnoughContrast\endlink.
 *
 * \since 5.11.1
 */
@protocol SBSWarningsObserver <NSObject>

/**
 * \brief Method invoked whenever a warning is raised by the frame processing engine.
 *
 * This method is called whenever one of the following warnings are raised by the frame processing
 * engine\link SBSWarningTooMuchGlare\endlink and \link SBSWarningNotEnoughContrast\endlink.
 *
 * \warning This method is not invoked from the main thread.
 *
 * \param barcodePicker the barcode picker instance that processed the frame.
 * \param warnings set of warnings.
 *
 * \since 5.11.1
 */
- (void)barcodePicker:(SBSBarcodePicker *)barcodePicker
   didProduceWarnings:(SBSWarning)warnings;

@end

NS_ASSUME_NONNULL_END
